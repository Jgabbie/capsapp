import express from 'express';
import { createNotification, getUserNotifications, markNotificationRead, markAllRead } from '../controllers/notificationController.js';
import requireUser from '../middleware/requireUser.js'; // Using your unified middleware

const router = express.Router();

router.get('/my', requireUser, getUserNotifications);
router.post('/create', requireUser, createNotification);
router.patch('/read-all', requireUser, markAllRead);
router.patch('/:id/read', requireUser, markNotificationRead);

export default router;