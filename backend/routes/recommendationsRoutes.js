import express from 'express';
import * as recommendController from '../controllers/recommendController.js';
import requireUser from '../middleware/requireUser.js';

const router = express.Router();

// Personalized recommendations for currently authenticated user
router.get('/', requireUser, recommendController.getRecommendations);

// Manual training trigger (can be restricted later)
router.post('/train', recommendController.trainModels);

// Health status of AI service
router.get('/health', recommendController.checkHealth);

export default router;
