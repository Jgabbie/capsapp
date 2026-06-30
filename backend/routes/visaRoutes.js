import express from "express";
import requireUser from "../middleware/requireUser.js";
import * as visaController from "../controllers/visaController.js";

const router = express.Router();

router.post("/apply", requireUser, visaController.applyVisa);
router.get("/applications", requireUser, visaController.getUserVisaApplications);
router.get("/applications/:id", requireUser, visaController.getVisaApplicationById);
router.put("/applications/:id/documents", requireUser, visaController.updateVisaApplicationWithDocs);
router.put("/applications/:id/choose-appointment", requireUser, visaController.chooseAppointment);
router.put("/applications/:id/passport-release-option", requireUser, visaController.passportReleaseOption);

export default router;