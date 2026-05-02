import express from "express";
import requireUser from "../middleware/requireUser.js";
import { applyPassport, getPassportApplications, chooseAppointment, updatePassportApplicationWithDocs } from "../controllers/passportController.js";

const router = express.Router();

router.post("/apply", requireUser, applyPassport);
router.get("/applications", requireUser, getPassportApplications);
router.put("/applications/:id/choose-appointment", requireUser, chooseAppointment);
router.put("/applications/:id/documents", requireUser, updatePassportApplicationWithDocs);

export default router;