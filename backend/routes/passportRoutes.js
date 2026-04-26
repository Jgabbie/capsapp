import express from "express";
import requireUser from "../middleware/requireUser.js";
import { applyPassport, getPassportApplications, chooseAppointment } from "../controllers/passportController.js";

const router = express.Router();

// 🔥 REMOVED applicationUpload.fields() so it accepts clean JSON
router.post("/apply", requireUser, applyPassport);
router.get("/applications", requireUser, getPassportApplications);
router.put("/applications/:id/choose-appointment", requireUser, chooseAppointment);

export default router;