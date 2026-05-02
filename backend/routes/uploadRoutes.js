import express from 'express';
import multer from 'multer';
// 🔥 SYNCED: Imported uploadCancellationProof
import { uploadReceiptProof, uploadBookingDocuments, uploadCancellationProof, uploadProfileImage } from '../controllers/uploadController.js';

const router = express.Router();

// Setup Multer memory storage (Cloudinary requires this!)
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.post('/upload-receipt', upload.single('file'), uploadReceiptProof);
router.post('/upload-booking-documents', upload.array('files', 20), uploadBookingDocuments);

// 🔥 SYNCED: Added the route for uploading cancellation proofs (Matches Web)
router.post('/upload-cancel-proof', upload.single('file'), uploadCancellationProof);

// Dedicated profile image upload
router.post('/upload-profile-image', upload.single('file'), uploadProfileImage);

export default router;