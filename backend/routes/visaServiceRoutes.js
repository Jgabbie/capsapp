import express from "express";
import requireUser from "../middleware/requireUser.js";
import requireAdmin from "../middleware/requireAdmin.js";
import * as visaServiceController from "../controllers/visaServiceController.js";

const router = express.Router();

router.get("/services", visaServiceController.getAllServices);
router.get("/get-service/:id", requireUser, visaServiceController.getService);
export default router;
