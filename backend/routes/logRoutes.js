import express from 'express';
import * as logController from '../controllers/logController.js';
import requireAdmin from '../middleware/requireAdmin.js';

const router = express.Router();

// Protected by requireAdmin: Only admins can fetch the logs
router.get('/get-logs', requireAdmin, logController.getLogs);
router.get('/get-audits', requireAdmin, logController.getAudits);

export default router;