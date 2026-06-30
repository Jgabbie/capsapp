import express from 'express';
import * as notificationController from '../controllers/notificationController.js';

import requireUser from '../middleware/requireUser.js';

const router = express.Router();

// NEW: Specifically for the Badge counter to show the TRUE total (e.g., 22)
router.get('/unread-count', requireUser, notificationController.getUnreadCount);
router.get('/my', requireUser, notificationController.getUserNotifications);
router.post('/create', requireUser, notificationController.createNotification);
router.patch('/read-all', requireUser, notificationController.markAllRead);
router.patch('/:id/read', requireUser, notificationController.markNotificationRead);
router.post('/push-token', requireUser, notificationController.registerPushToken);
router.post('/test-direct-push', requireUser, notificationController.testDirectPush);

export default router;