import Notification from '../models/notification.js';

export const createNotification = async (req, res) => {
    const { userId, title, message, type, link, metadata } = req.body;
    if (!userId || !title || !message) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    try {
        const notification = await Notification.create({ userId, title, message, type, link, metadata });
        res.status(201).json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Error creating notification', error: error.message });
    }
};

export const getUserNotifications = async (req, res) => {
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

export const markNotificationRead = async (req, res) => {
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

export const markAllRead = async (req, res) => {
    try {
        await Notification.updateMany({ userId: req.userId, isRead: false }, { isRead: true });
        res.status(200).json({ message: 'Notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating notifications', error: error.message });
    }
};