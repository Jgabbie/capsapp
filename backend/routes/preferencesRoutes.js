import express from 'express';
import * as preferrencesController from '../controllers/preferrencesController.js';

// FIXED: We use your mobile backend's specific middleware here!
import requireUser from '../middleware/requireUser.js';

const router = express.Router();

router.post('/save', requireUser, preferrencesController.savePreferrences);
router.get('/me', requireUser, preferrencesController.getMyPreferrences);

export default router;