import express from "express";
import requireUser from "../middleware/requireUser.js";
import applicationUpload from "../middleware/applicationUpload.js";
import { applyVisa, getVisaApplications, chooseAppointment } from "../controllers/visaController.js";

const router = express.Router();

router.post(
    "/apply",
    requireUser,
    applicationUpload.fields([
        { name: "validPassport", maxCount: 1 },
        { name: "completedVisaApplicationForm", maxCount: 1 },
        { name: "passportSizePhoto", maxCount: 1 },
        { name: "bankCertificateAndStatement", maxCount: 1 },
    ]),
    applyVisa
);

router.get("/applications", requireUser, getVisaApplications);

// 🔥 NEW ROUTE: For confirming suggested appointments 🔥
router.put("/applications/:id/choose-appointment", requireUser, chooseAppointment);

export default router;