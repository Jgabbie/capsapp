import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

const uploadBufferToCloudinary = (file, folder) => new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'auto' },
        (error, result) => {
            if (error) return reject(error);
            resolve(result);
        }
    );
    streamifier.createReadStream(file.buffer).pipe(stream);
});

export const uploadReceiptProof = async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
    try {
        const uploadResult = await uploadBufferToCloudinary(req.file, 'manual-deposits');
        return res.status(200).json({ message: 'File uploaded successfully.', url: uploadResult.secure_url });
    } catch (err) {
        console.error("Cloudinary Receipt Upload Error:", err);
        res.status(500).json({ message: "Upload failed", error: err.message });
    }
};

export const uploadBookingDocuments = async (req, res) => {
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No files uploaded.' });
    try {
        const uploadPromises = req.files.map(file =>
            uploadBufferToCloudinary(file, 'booking-documents').then(result => result.secure_url)
        );
        const uploadedUrls = await Promise.all(uploadPromises);
        return res.status(200).json({ message: 'Files uploaded successfully.', urls: uploadedUrls });
    } catch (err) {
        console.error("Cloudinary Document Upload Error:", err);
        res.status(500).json({ message: "Upload failed", error: err.message });
    }
};

export const uploadCancellationProof = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    try {
        const uploadResult = await uploadBufferToCloudinary(req.file, 'cancellation-proofs');

        return res.status(200).json({
            message: 'File uploaded successfully.',
            url: uploadResult.secure_url,
        });
    }
    catch (err) {
        console.error("Cloudinary Cancel Proof Error:", err);
        res.status(500).json({ message: "Upload failed", error: err.message });
    }
};

export const uploadProfileImage = async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
    try {
        const uploadResult = await uploadBufferToCloudinary(req.file, 'profile-images');
        return res.status(200).json({ message: 'Profile image uploaded successfully.', url: uploadResult.secure_url });
    } catch (err) {
        console.error('Cloudinary Profile Upload Error:', err);
        res.status(500).json({ message: 'Upload failed', error: err.message });
    }
};