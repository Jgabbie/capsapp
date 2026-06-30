import express from "express";
import requireUser from "../middleware/requireUser.js";
import * as passportController from "../controllers/passportController.js";

const router = express.Router();

router.post("/apply", requireUser, passportController.applyPassport);
router.get("/applications", requireUser, passportController.getPassportApplications);
router.put("/applications/:id/choose-appointment", requireUser, passportController.chooseAppointment);
router.put("/applications/:id/documents", requireUser, passportController.updatePassportApplicationWithDocs);
router.get('/applications/:id', requireUser, passportController.getPassportApplicationById);

export default router;