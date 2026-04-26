import express from "express";
import requireUser from "../middleware/requireUser.js";
import { applyVisa, getVisaApplications, chooseAppointment } from "../controllers/visaController.js";

const router = express.Router();

// 🔥 REMOVED applicationUpload.fields() here too
router.post("/apply", requireUser, applyVisa);
router.get("/applications", requireUser, getVisaApplications);
router.put("/applications/:id/choose-appointment", requireUser, chooseAppointment);

export default router;