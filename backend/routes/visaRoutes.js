import express from "express";
import requireUser from "../middleware/requireUser.js";
import { applyVisa, getVisaApplications } from "../controllers/visaController.js";

const router = express.Router();

router.post("/apply", requireUser, applyVisa);
router.get("/applications", requireUser, getVisaApplications);

export default router;
