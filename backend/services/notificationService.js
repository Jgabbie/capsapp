import Notification from "../models/notification.js";
import User from "../models/users.js";

import {
    sendExpoPushNotification,
} from "../utils/sendExpoPushNotification.js";

const EXPO_PUSH_URL =
    "https://exp.host/--/api/v2/push/send";

const ANDROID_CHANNEL_ID =
    "mrc-notifications-v3";

const isValidExpoToken = (token) => {
    return (
        typeof token === "string" &&
        /^(ExpoPushToken|ExponentPushToken)\[[^\]]+\]$/.test(token)
    );
};

/**
 * Sends a saved Notification document as a push notification.
 */
export const sendNotificationPush = async notification => {
    const user = await User.findById(
        notification.userId
    ).select("expoPushTokens");

    if (!user) {
        return {
            sent: false,
            reason: "USER_NOT_FOUND",
            tickets: [],
        };
    }

    // This declaration was missing in your current service.
    const tokens = Array.isArray(user.expoPushTokens)
        ? user.expoPushTokens.filter(Boolean)
        : [];

    if (tokens.length === 0) {
        return {
            sent: false,
            reason: "NO_PUSH_TOKENS",
            tickets: [],
        };
    }

    const savedNotification =
        typeof notification.toObject === "function"
            ? notification.toObject({
                flattenMaps: true,
            })
            : notification;

    const pushData = {
        notificationId:
            savedNotification._id?.toString() || "",

        type:
            savedNotification.type || "general",

        link:
            savedNotification.link || "",

        metadata:
            savedNotification.metadata || {},

        createdAt: savedNotification.createdAt
            ? new Date(
                savedNotification.createdAt
            ).toISOString()
            : new Date().toISOString(),
    };

    const tickets =
        await sendExpoPushNotification({
            tokens,
            title: savedNotification.title,
            message: savedNotification.message,
            data: pushData,
        });

    const invalidTokens = tickets
        .map((ticket, index) => {
            if (
                ticket?.status === "error" &&
                ticket?.details?.error ===
                "DeviceNotRegistered"
            ) {
                return tokens[index];
            }

            return null;
        })
        .filter(Boolean);

    if (invalidTokens.length > 0) {
        await User.updateOne(
            {
                _id: notification.userId,
            },
            {
                $pull: {
                    expoPushTokens: {
                        $in: invalidTokens,
                    },
                },
            }
        );
    }

    const ticketErrors = tickets.filter(
        ticket => ticket?.status === "error"
    );

    if (ticketErrors.length > 0) {
        return {
            sent: false,
            reason: "EXPO_TICKET_ERROR",
            tickets,
        };
    }

    return {
        sent: true,
        tickets,
    };
};

/**
 * Creates an in-system notification and sends
 * the same notification as a remote push.
 */
export const createNotificationAndPush = async ({
    userId,
    title,
    message,
    type = "general",
    link = "",
    metadata = {},
}) => {
    const notification = await Notification.create({
        userId,
        title,
        message,
        type,
        link,
        metadata,
        pushStatus: "sending",
        pushAttempts: 1,
        pushClaimedAt: new Date(),
    });

    try {
        const pushResult =
            await sendNotificationPush(notification);

        if (!pushResult.sent) {
            throw new Error(
                pushResult.reason ||
                "Push notification was not sent."
            );
        }

        notification.pushStatus = "sent";
        notification.pushSentAt = new Date();
        notification.pushLastError = null;
        notification.pushTickets =
            pushResult.tickets || [];

        await notification.save();

        return {
            notification,
            pushResult,
        };
    } catch (error) {
        notification.pushStatus = "failed";
        notification.pushLastError =
            error.message || "Unknown push error";

        await notification.save();

        return {
            notification,
            pushResult: {
                sent: false,
                reason: "PUSH_EXCEPTION",
                error: error.message,
            },
        };
    }
};