import express from "express";
import requireUser from "../middleware/requireUser.js";
import { createCheckoutSession, createManualPayment, handlePayMongoWebhook, createCheckoutToken } from "../controllers/payController.js";

const router = express.Router();

router.post("/create-checkout-token", requireUser, createCheckoutToken);
router.post("/create-checkout-session", requireUser, createCheckoutSession);
router.post("/manual", requireUser, createManualPayment);
router.post("/webhook/paymongo", express.raw({ type: 'application/json' }), handlePayMongoWebhook);

export default router;