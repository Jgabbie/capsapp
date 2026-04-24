import express from 'express';
import multer from 'multer';
import { chatAction, uploadKnowledge, knowledgeStatus } from '../controllers/chatbotController.js';

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
});

router.post('/chat', chatAction);
router.post('/knowledge/upload', upload.single('file'), uploadKnowledge);
router.get('/knowledge/status', knowledgeStatus);

export default router;