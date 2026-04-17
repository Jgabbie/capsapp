import express from 'express';
import multer from 'multer';
import { uploadReceiptProof, uploadBookingDocuments } from '../controllers/uploadController.js';

const router = express.Router();

// Setup Multer memory storage (Cloudinary requires this!)
const storage = multer.memoryStorage();
const upload = multer({ 
    storage, 
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.post('/upload-receipt', upload.single('file'), uploadReceiptProof);
router.post('/upload-booking-documents', upload.array('files', 20), uploadBookingDocuments);

export default router;