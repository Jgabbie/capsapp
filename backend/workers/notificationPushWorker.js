import Notification from "../models/notification.js";

import {
    sendNotificationPush,
} from "../services/notificationService.js";

const WORKER_INTERVAL_MS = 5000;
const MAX_PUSH_ATTEMPTS = 5;

let workerRunning = false;

const claimNextNotification = async () => {
    return Notification.findOneAndUpdate(
        {
            $or: [
                {
                    pushStatus: "pending",
                },
                {
                    pushStatus: "failed",
                    pushAttempts: {
                        $lt: MAX_PUSH_ATTEMPTS,
                    },
                },
            ],
        },
        {
            $set: {
                pushStatus: "sending",
                pushClaimedAt: new Date(),
            },
            $inc: {
                pushAttempts: 1,
            },
        },
        {
            new: true,
            sort: {
                createdAt: 1,
            },
        }
    );
};

const processNextNotification = async () => {
    const notification =
        await claimNextNotification();

    if (!notification) {
        return false;
    }

    try {
        const pushResult =
            await sendNotificationPush(notification);

        if (!pushResult.sent) {
            throw new Error(
                pushResult.reason ||
                "Push notification was not sent."
            );
        }

        await Notification.updateOne(
            {
                _id: notification._id,
            },
            {
                $set: {
                    pushStatus: "sent",
                    pushSentAt: new Date(),
                    pushLastError: null,
                    pushTickets:
                        pushResult.tickets || [],
                },
            }
        );
    } catch (error) {
        await Notification.updateOne(
            {
                _id: notification._id,
            },
            {
                $set: {
                    pushStatus: "failed",
                    pushLastError:
                        error.message ||
                        "Unknown push error",
                },
            }
        );

        console.error(
            `[PUSH WORKER] Failed ${notification._id}:`,
            error.message
        );
    }

    return true;
};

const processPendingNotifications = async () => {
    if (workerRunning) {
        return;
    }

    workerRunning = true;

    try {
        let hasNotification = true;

        while (hasNotification) {
            hasNotification =
                await processNextNotification();
        }
    } catch (error) {
        console.error(
            "[PUSH WORKER] Worker error:",
            error
        );
    } finally {
        workerRunning = false;
    }
};

export const startNotificationPushWorker = () => {
    console.log(
        "[PUSH WORKER] Notification worker started."
    );

    processPendingNotifications();

    setInterval(
        processPendingNotifications,
        WORKER_INTERVAL_MS
    );
};