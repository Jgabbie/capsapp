import express from 'express';
import multer from 'multer';
import * as uploadController from '../controllers/uploadController.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.post('/upload-receipt', upload.single('file'), uploadController.uploadReceiptProof);
router.post('/upload-booking-documents', upload.array('files', 20), uploadController.uploadBookingDocuments);
router.post('/upload-passport-requirements', upload.array('files', 20), uploadController.uploadBookingDocuments);
router.post('/upload-cancel-proof', upload.single('file'), uploadController.uploadCancellationProof);
router.post('/upload-profile-image', upload.single('file'), uploadController.uploadProfileImage);

export default router;