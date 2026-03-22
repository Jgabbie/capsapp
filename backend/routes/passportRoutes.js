import express from "express";
import requireUser from "../middleware/requireUser.js";
import { applyPassport, getPassportApplications } from "../controllers/passportController.js";

const router = express.Router();

router.post("/apply", requireUser, applyPassport);
router.get("/applications", requireUser, getPassportApplications);

export default router;
