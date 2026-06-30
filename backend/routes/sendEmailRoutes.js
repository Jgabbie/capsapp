import express from 'express';
import * as sendEmailController from '../controllers/sendEmailController.js';
const router = express.Router();

router.post('/contact', sendEmailController.sendContactEmail);

export default router;