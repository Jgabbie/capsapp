import express from "express";
import requireUser from "../middleware/requireUser.js";
import applicationUpload from "../middleware/applicationUpload.js";
import { applyPassport, getPassportApplications } from "../controllers/passportController.js";

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

export default router;
