import express from "express";
import requireUser from "../middleware/requireUser.js";
import applicationUpload from "../middleware/applicationUpload.js";
// 🔥 IMPORTED chooseAppointment HERE 🔥
import { applyPassport, getPassportApplications, chooseAppointment } from "../controllers/passportController.js";

const router = express.Router();

router.post(
    "/apply",
    requireUser,
    applicationUpload.fields([
        { name: "passportPhoto", maxCount: 1 },
        { name: "applicationForm", maxCount: 1 },
        { name: "psaBirthCertificate", maxCount: 1 },
        { name: "validGovernmentId", maxCount: 1 },
        { name: "oldPassport", maxCount: 1 },
    ]),
    applyPassport
);
router.get("/applications", requireUser, getPassportApplications);

// 🔥 NEW ROUTE: For confirming suggested appointments 🔥
router.put("/applications/:id/choose-appointment", requireUser, chooseAppointment);

export default router;