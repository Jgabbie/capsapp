import express from 'express';
import multer from 'multer';
import * as chatbotController from '../controllers/chatbotController.js';

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
});

router.post('/chat', chatbotController.chatAction);
router.post('/knowledge/upload', upload.single('file'), chatbotController.uploadKnowledge);
router.get('/knowledge/status', chatbotController.knowledgeStatus);

export default router;