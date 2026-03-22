import express from "express";
import { getPackages, getPackage } from "../controllers/packageController.js";

const router = express.Router();

// Mobile app endpoints for reading packages
router.get('/get-packages', getPackages);
router.get('/get-package/:id', getPackage);

export default router;