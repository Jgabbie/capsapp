import express from "express";
import * as packageController from "../controllers/packageController.js";
import requireAdmin from "../middleware/requireAdmin.js";

const router = express.Router();

// Mobile app endpoints for reading packages
router.get('/get-packages', packageController.getPackages);
router.get('/get-package/:id', packageController.getPackage);


export default router;