import express from "express";
const router = express.Router();
import { createCheckoutSession, createManualPayment, handlePayMongoWebhook } from "../controllers/payController.js";
import requireUser from "../middleware/requireUser.js";

router.post("/create-checkout-session", requireUser, createCheckoutSession);
router.post("/manual", requireUser, createManualPayment);
router.post('/webhook/paymongo', express.raw({ type: 'application/json' }), handlePayMongoWebhook);

export default router;