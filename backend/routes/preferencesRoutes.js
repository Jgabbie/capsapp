import express from 'express';
import { savePreferrences, getMyPreferrences } from '../controllers/preferrencesController.js';

// 🔥 FIXED: We use your mobile backend's specific middleware here!
import requireUser from '../middleware/requireUser.js'; 

const router = express.Router();

router.post('/save', requireUser, savePreferrences);
router.get('/me', requireUser, getMyPreferrences);

export default router;