import express from "express";
import requireUser from "../middleware/requireUser.js";
import requireAdmin from "../middleware/requireAdmin.js";
import {
  createService,
  deleteService,
  getAllServices,
  getService,
  updateService,
} from "../controllers/visaServiceController.js";

const router = express.Router();

router.get("/services", getAllServices);
router.get("/get-service/:id", requireUser, getService);
router.post("/create-service", requireUser, requireAdmin, createService);
router.put("/update-service/:id", requireUser, requireAdmin, updateService);
router.delete("/delete-service/:id", requireUser, requireAdmin, deleteService);

export default router;
