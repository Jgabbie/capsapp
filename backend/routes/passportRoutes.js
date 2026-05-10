import express from "express";
import requireUser from "../middleware/requireUser.js";
import { applyPassport, chooseAppointment, updatePassportApplicationWithDocs } from "../controllers/passportController.js";

const router = express.Router();

router.post("/apply", requireUser, applyPassport);
router.put("/applications/:id/choose-appointment", requireUser, chooseAppointment);
router.put("/applications/:id/documents", requireUser, updatePassportApplicationWithDocs);

export default router;