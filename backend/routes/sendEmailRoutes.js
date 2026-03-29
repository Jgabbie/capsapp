import express from 'express';
import { sendContactEmail } from '../controllers/sendEmailController.js';

const router = express.Router();

// Route to handle contact form submission
router.post('/contact', sendContactEmail);

export default router;