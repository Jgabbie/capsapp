import Notification from '../models/notification.js';
import User from '../models/users.js';

import {
    createNotificationAndPush,
} from "../services/notificationService.js";


//create notification function
const testDirectPush = async (req, res) => {
    try {
        const userId = req.userId;

        const user = await User.findById(userId)
            .select("expoPushTokens");

        const tokens = Array.isArray(user?.expoPushTokens)
            ? user.expoPushTokens.filter(Boolean)
            : [];

        if (tokens.length === 0) {
            return res.status(400).json({
                success: false,
                reason: "NO_PUSH_TOKENS",
                userId,
                storedTokens: [],
            });
        }

        const messages = tokens.map(token => ({
            to: token,
            sound: "default",
            title: "M&RC Push Test",
            body: "Your remote push notification is working.",
            priority: "high",
            channelId: "mrc-notifications-v3",
            data: {
                type: "test",
                link: "/notifications",
            },
        }));

        const expoResponse = await fetch(
            "https://exp.host/--/api/v2/push/send",
            {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Accept-Encoding": "gzip, deflate",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(messages),
            }
        );

        const expoResult = await expoResponse.json();

        return res.status(200).json({
            success: expoResponse.ok,
            userId,
            storedTokens: tokens,
            expoHttpStatus: expoResponse.status,
            expoResult,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack,
        });
    }
};


//get notifications for a user
const registerPushToken = async (req, res) => {
    try {
        const userId = req.userId;
        const { token } = req.body;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        if (!token || typeof token !== "string") {
            return res.status(400).json({
                message: "Push token is required.",
            });
        }

        const isValidExpoToken =
            /^(ExpoPushToken|ExponentPushToken)\[[^\]]+\]$/.test(
                token
            );

        if (!isValidExpoToken) {
            return res.status(400).json({
                message: "Invalid Expo push token.",
            });
        }

        // Prevent the same device token from belonging to
        // multiple user accounts.
        await User.updateMany(
            {
                _id: { $ne: userId },
                expoPushTokens: token,
            },
            {
                $pull: {
                    expoPushTokens: token,
                },
            }
        );

        const user = await User.findByIdAndUpdate(
            userId,
            {
                $addToSet: {
                    expoPushTokens: token,
                },
            },
            {
                new: true,
            }
        ).select("expoPushTokens");

        if (!user) {
            return res.status(404).json({
                message: "User not found.",
            });
        }

        return res.status(200).json({
            message: "Push token registered.",
            expoPushTokens: user.expoPushTokens,
        });
    } catch (error) {
        console.error(
            "Register push token error:",
            error
        );

        console.error("REGISTER PUSH TOKEN ERROR:", error);
        console.error("ERROR MESSAGE:", error.message);
        console.error("ERROR STACK:", error.stack);

        return res.status(500).json({
            message: "Failed to register push token.",
            error: error.message,
        });
    }
};


//create notification function
const createNotification = async (req, res) => {
    const {
        userId,
        title,
        message,
        type,
        link,
        metadata,
    } = req.body;

    if (!userId || !title || !message) {
        return res.status(400).json({
            message: "Missing required fields",
        });
    }

    try {
        const result = await createNotificationAndPush({
            userId,
            title,
            message,
            type,
            link,
            metadata,
            pushStatus: "pending",
        });

        return res.status(201).json({
            success: true,
            notification: result.notification,
            pushResult: result.pushResult,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error creating notification",
            error: error.message,
        });
    }
};


//get notifications for a user
const getUserNotifications = async (req, res) => {
    const limit = Number.parseInt(req.query.limit, 10) || 20;
    try {
        const notifications = await Notification.find({ userId: req.userId })
            .sort({ createdAt: -1 })
            .limit(limit);
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications', error: error.message });
    }
};


//mark notification as read function
const markNotificationRead = async (req, res) => {
    const { id } = req.params;
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: id, userId: req.userId },
            { isRead: true },
            { new: true }
        );
        if (!notification) return res.status(404).json({ message: 'Notification not found' });
        res.status(200).json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Error updating notification', error: error.message });
    }
};


//mark all notifications as read function
const markAllRead = async (req, res) => {
    try {
        await Notification.updateMany({ userId: req.userId, isRead: false }, { isRead: true });
        res.status(200).json({ message: 'Notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating notifications', error: error.message });
    }
};


//get unread notification count function
const getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            userId: req.userId,
            isRead: false
        });
        res.status(200).json({ unreadCount: count });
    } catch (error) {
        res.status(500).json({ message: 'Error counting notifications', error: error.message });
    }
};

export {
    testDirectPush,
    registerPushToken,
    createNotification,
    getUserNotifications,
    markNotificationRead,
    markAllRead,
    getUnreadCount
};