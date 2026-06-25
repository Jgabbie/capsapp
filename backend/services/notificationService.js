import Notification from "../models/notification.js";
import User from "../models/users.js";

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
export const sendNotificationPush = async (notification) => {
    const user = await User.findById(
        notification.userId
    ).select("expoPushTokens");

    if (!user) {
        console.error(
            `[PUSH] USER_NOT_FOUND: ${notification.userId}`
        );

        return {
            sent: false,
            reason: "USER_NOT_FOUND",
        };
    }

    if (tokens.length === 0) {
        console.error(
            `[PUSH] NO_PUSH_TOKENS for user: ${notification.userId}`
        );

        return {
            sent: false,
            reason: "NO_PUSH_TOKENS",
        };
    }

    /*
     * Convert the Mongoose document into a plain object.
     * flattenMaps handles metadata if it uses a Map field.
     */
    const savedNotification =
        notification.toObject({
            flattenMaps: true,
        });

    /*
     * These fields come directly from the saved
     * Notification model.
     */
    const pushData = {
        notificationId:
            savedNotification._id.toString(),

        type:
            savedNotification.type || "general",

        link:
            savedNotification.link || "",

        metadata:
            savedNotification.metadata || {},

        createdAt:
            savedNotification.createdAt
                ? new Date(
                    savedNotification.createdAt
                ).toISOString()
                : new Date().toISOString(),
    };

    /*
     * Generate one Expo message for each registered
     * device belonging to the user.
     */
    const messages = tokens.map((token) => ({
        to: token,

        // From the saved Notification document
        title: savedNotification.title,
        body: savedNotification.message,

        data: pushData,

        priority: "high",
        channelId: ANDROID_CHANNEL_ID,
    }));

    const response = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(messages),
    });

    const result = await response.json();

    console.log(
        "Expo push result:",
        JSON.stringify(result, null, 2)
    );

    if (!response.ok) {
        throw new Error(
            result?.errors?.[0]?.message ||
            "Expo push request failed."
        );
    }

    const tickets = Array.isArray(result.data)
        ? result.data
        : result.data
            ? [result.data]
            : [];

    /*
     * Remove device tokens Expo says are no longer
     * registered.
     */
    const invalidTokens = tickets
        .map((ticket, index) => {
            const errorCode =
                ticket?.details?.error;

            if (
                ticket?.status === "error" &&
                errorCode === "DeviceNotRegistered"
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

        console.log(
            "Removed invalid Expo tokens:",
            invalidTokens
        );
    }

    return {
        sent: true,
        tickets,
    };
};

/**
 * Creates one in-system Notification document and
 * sends that exact saved notification as a push.
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
    });

    try {
        const pushResult = await sendNotificationPush(notification);

        console.log(
            `[PUSH] Result for notification ${notification._id}:`,
            JSON.stringify(pushResult, null, 2)
        );
    } catch (error) {
        console.error(
            `[PUSH] Failed for notification ${notification._id}:`,
            error.message
        );
    }

    return notification;
};