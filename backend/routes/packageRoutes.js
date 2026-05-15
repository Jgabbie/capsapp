import express from "express";
import { getPackages, getPackage, updateItineraryImages, addSampleItineraryImages } from "../controllers/packageController.js";
import requireAdmin from "../middleware/requireAdmin.js";

const router = express.Router();

// Mobile app endpoints for reading packages
router.get('/get-packages', getPackages);
router.get('/get-package/:id', getPackage);

// Admin endpoints
router.put('/update-itinerary-images/:packageId', requireAdmin, updateItineraryImages);
router.post('/add-sample-itinerary-images', requireAdmin, addSampleItineraryImages);

export default router;