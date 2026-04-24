import express from 'express';
import { 
    createNotification, 
    getUserNotifications, 
    markNotificationRead, 
    markAllRead,
    getUnreadCount // 🔥 Import the new count function
} from '../controllers/notificationController.js';
import requireUser from '../middleware/requireUser.js'; 

const router = express.Router();

// 🔥 NEW: Specifically for the Badge counter to show the TRUE total (e.g., 22)
router.get('/unread-count', requireUser, getUnreadCount);

router.get('/my', requireUser, getUserNotifications);
router.post('/create', requireUser, createNotification);
router.patch('/read-all', requireUser, markAllRead);
router.patch('/:id/read', requireUser, markNotificationRead);

export default router;