import express from "express";
import requireUser from "../middleware/requireUser.js";
import { createCheckoutSession, createCheckoutToken } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/create-checkout-token", requireUser, createCheckoutToken);
router.post("/create-checkout-session", createCheckoutSession);

export default router;
