import express from "express";
import requireUser from "../middleware/requireUser.js";
import {
  applyVisa,
  getUserVisaApplications,
  getVisaApplicationById,
  chooseAppointment,
  updateVisaApplicationWithDocs,
  passportReleaseOption
} from "../controllers/visaController.js";

const router = express.Router();

router.post("/apply", requireUser, applyVisa);
router.get("/applications", requireUser, getUserVisaApplications);
router.get("/applications/:id", requireUser, getVisaApplicationById);
router.put("/applications/:id/documents", requireUser, updateVisaApplicationWithDocs);
router.put("/applications/:id/choose-appointment", requireUser, chooseAppointment);
router.put("/applications/:id/passport-release-option", requireUser, passportReleaseOption);

export default router;