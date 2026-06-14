import express from "express";
import requireUser from "../middleware/requireUser.js";
import {
    createCheckoutSession,
    createCheckoutSessionQuotation,
    createManualPaymentQuotation,
    createCheckoutSessionDeposit,
    createCheckoutSessionPassport,
    createCheckoutSessionVisa,
    createCheckoutSessionPassportPenalty,
    createCheckoutSessionVisaPenalty,
    createCheckoutSessionDeliveryFee,
    createManualPaymentDeposit,
    createManualPayment,
    createManualPaymentPassport,
    createManualPaymentVisa,
    createManualPaymentVisaPenalty,
    createManualPaymentPassportPenalty,
    createManualPaymentDeliveryFee,
    handlePayMongoWebhook,
    createCheckoutToken
} from "../controllers/paymentController.js";

const router = express.Router();

router.post("/create-checkout-token", requireUser, createCheckoutToken);
router.post("/create-checkout-session", requireUser, createCheckoutSession);
router.post("/create-checkout-session-quotation", requireUser, createCheckoutSessionQuotation);
router.post("/create-checkout-session-passport", requireUser, createCheckoutSessionPassport);
router.post("/create-checkout-session-visa", requireUser, createCheckoutSessionVisa);
router.post("/create-checkout-session-passport-penalty", requireUser, createCheckoutSessionPassportPenalty);
router.post("/create-checkout-session-visa-penalty", requireUser, createCheckoutSessionVisaPenalty);
router.post("/create-checkout-session-delivery-fee", requireUser, createCheckoutSessionDeliveryFee);
router.post("/create-checkout-session-deposit", requireUser, createCheckoutSessionDeposit);
router.post("/manual-quotation", requireUser, createManualPaymentQuotation);
router.post("/manual-deposit", requireUser, createManualPaymentDeposit);
router.post("/manual-payment", requireUser, createManualPayment);
router.post("/manual-passport", requireUser, createManualPaymentPassport);
router.post("/manual-visa", requireUser, createManualPaymentVisa);
router.post("/manual-visa-penalty", requireUser, createManualPaymentVisaPenalty);
router.post("/manual-passport-penalty", requireUser, createManualPaymentPassportPenalty);
router.post("/manual-delivery-fee", requireUser, createManualPaymentDeliveryFee);
router.post("/webhook/paymongo", express.raw({ type: 'application/json' }), handlePayMongoWebhook);

export default router;