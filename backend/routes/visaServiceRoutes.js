import express from "express";
import requireUser from "../middleware/requireUser.js";
import requireAdmin from "../middleware/requireAdmin.js";
import {
  getAllServices,
  getService,
} from "../controllers/visaServiceController.js";

const router = express.Router();

router.get("/services", getAllServices);
router.get("/get-service/:id", requireUser, getService);
export default router;
