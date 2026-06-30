import express from 'express';
import * as recommendController from '../controllers/recommendController.js';
import requireUser from '../middleware/requireUser.js';

const router = express.Router();


router.get('/', requireUser, recommendController.getRecommendations);
router.post('/train', recommendController.trainModels);
router.get('/health', recommendController.checkHealth);

export default router;
