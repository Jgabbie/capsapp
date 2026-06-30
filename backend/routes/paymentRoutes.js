import express from "express";
import requireUser from "../middleware/requireUser.js";
import * as paymentController from "../controllers/paymentController.js";

const router = express.Router();

router.post("/create-checkout-token", requireUser, paymentController.createCheckoutToken);
router.post("/create-checkout-session", requireUser, paymentController.createCheckoutSession);
router.post("/create-checkout-session-quotation", requireUser, paymentController.createCheckoutSessionQuotation);
router.post("/create-checkout-session-passport", requireUser, paymentController.createCheckoutSessionPassport);
router.post("/create-checkout-session-visa", requireUser, paymentController.createCheckoutSessionVisa);
router.post("/create-checkout-session-passport-penalty", requireUser, paymentController.createCheckoutSessionPassportPenalty);
router.post("/create-checkout-session-visa-penalty", requireUser, paymentController.createCheckoutSessionVisaPenalty);
router.post("/create-checkout-session-delivery-fee", requireUser, paymentController.createCheckoutSessionDeliveryFee);
router.post("/create-checkout-session-deposit", requireUser, paymentController.createCheckoutSessionDeposit);
router.post("/manual-quotation", requireUser, paymentController.createManualPaymentQuotation);
router.post("/manual-deposit", requireUser, paymentController.createManualPaymentDeposit);
router.post("/manual-payment", requireUser, paymentController.createManualPayment);
router.post("/manual-passport", requireUser, paymentController.createManualPaymentPassport);
router.post("/manual-visa", requireUser, paymentController.createManualPaymentVisa);
router.post("/manual-visa-penalty", requireUser, paymentController.createManualPaymentVisaPenalty);
router.post("/manual-passport-penalty", requireUser, paymentController.createManualPaymentPassportPenalty);
router.post("/manual-delivery-fee", requireUser, paymentController.createManualPaymentDeliveryFee);
router.post("/webhook/paymongo", express.raw({ type: 'application/json' }), paymentController.handlePayMongoWebhook);

export default router;