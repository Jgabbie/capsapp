import express from 'express';
import { getLogs, getAudits } from '../controllers/logController.js';
import requireAdmin from '../middleware/requireAdmin.js'; 

const router = express.Router();

// Protected by requireAdmin: Only admins can fetch the logs
router.get('/get-logs', requireAdmin, getLogs);
router.get('/get-audits', requireAdmin, getAudits);

export default router;