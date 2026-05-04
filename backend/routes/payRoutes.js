import express from "express";
import requireUser from "../middleware/requireUser.js";
import { createCheckoutSession, createCheckoutSessionQuotation, createManualPaymentQuotation, createCheckoutSessionDeposit, createCheckoutSessionPassport, createCheckoutSessionVisa, createManualPaymentDeposit, createManualPayment, createManualPaymentPassport, createManualPaymentVisa, handlePayMongoWebhook, createCheckoutToken } from "../controllers/payController.js";

const router = express.Router();

router.post("/create-checkout-token", requireUser, createCheckoutToken);
router.post("/create-checkout-session", requireUser, createCheckoutSession);
router.post("/create-checkout-session-quotation", requireUser, createCheckoutSessionQuotation);
router.post("/create-checkout-session-passport", requireUser, createCheckoutSessionPassport);
router.post("/create-checkout-session-visa", requireUser, createCheckoutSessionVisa);
router.post("/create-checkout-session-deposit", requireUser, createCheckoutSessionDeposit);
router.post("/manual-quotation", requireUser, createManualPaymentQuotation);
router.post("/manual-deposit", requireUser, createManualPaymentDeposit);
router.post("/manual-payment", requireUser, createManualPayment);
router.post("/manual-passport", requireUser, createManualPaymentPassport);
router.post("/manual-visa", requireUser, createManualPaymentVisa);
router.post("/webhook/paymongo", express.raw({ type: 'application/json' }), handlePayMongoWebhook);

export default router;