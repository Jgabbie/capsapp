import crypto from "crypto";
import axios from "axios";
import TokenCheckout from "../models/tokenCheckout.js";
import BookingModel from "../models/booking.js";       
import TransactionModel from "../models/transaction.js"; // 🔥 FIXED: Singular transaction.js
import PackageModel from "../models/package.js"; // Added for package lookups

export const createCheckoutToken = async (req, res) => {
    const userId = req.userId;
    const { totalPrice, bookingId } = req.body;

    try {
        const numericTotal = Number(totalPrice || 0);
        if (!numericTotal || Number.isNaN(numericTotal)) {
            return res.status(400).json({ message: "Valid totalPrice is required" });
        }

        // Web Sync: UUID and 5-minute expiry
        const token = crypto.randomUUID();

        await TokenCheckout.create({
            token,
            userId,
            bookingId, // Synced from web
            amount: numericTotal, // Synced from web
            totalPrice: numericTotal, // Kept for backwards compatibility
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
        });

        return res.status(201).json({ token });
    } catch (error) {
        return res.status(500).json({ message: "Error creating checkout token", error: error.message });
    }
};

export const createCheckoutSession = async (req, res) => {
    const { checkoutToken, totalPrice, packageName, successUrl, cancelUrl, paymentPayload } = req.body;

    // Safely handle both flat payloads and nested { paymentPayload } structures
    const actualPayload = paymentPayload || req.body;

    try {
        const tokenToUse = actualPayload.checkoutToken || checkoutToken;
        const priceToUse = actualPayload.totalPrice || totalPrice;

        if (!tokenToUse || !priceToUse) {
            return res.status(400).json({ message: "checkoutToken and totalPrice are required" });
        }

        const tokenRecord = await TokenCheckout.findOne({ token: tokenToUse });
        if (!tokenRecord) {
            return res.status(404).json({ message: "Invalid or expired checkout token" });
        }

        const payMongoSecret = process.env.PAYMONGO_SECRET_KEY;
        if (!payMongoSecret) {
            return res.status(500).json({ message: "PAYMONGO_SECRET_KEY is not configured" });
        }

        let pkgName = packageName || actualPayload.packageName || "Tour Package";
        if (actualPayload.packageId && pkgName === "Tour Package") {
            const pkg = await PackageModel.findById(actualPayload.packageId);
            if (pkg) pkgName = pkg.packageName;
        }

        // 🔥 WEB SYNCED COMPUTATION: 3.5% + ₱15 Fee 🔥
        const baseAmountCents = Math.round(Number(priceToUse) * 100);
        const convenienceFeeCents = Math.round((baseAmountCents * 0.035) + 1500);

        const payload = {
            data: {
                attributes: {
                    billing: {
                        name: actualPayload.leadEmail ? "User" : "CapsApp User",
                        email: actualPayload.leadEmail || "capsapp@example.com",
                    },
                    line_items: [
                        {
                            name: pkgName,
                            quantity: 1,
                            amount: baseAmountCents,
                            currency: "PHP",
                        },
                        {
                            name: "Convenience Fee",
                            description: "Payment processing and service fee",
                            quantity: 1,
                            amount: convenienceFeeCents,
                            currency: "PHP",
                        }
                    ],
                    payment_method_types: ["card", "gcash", "grab_pay", "paymaya", "qrph"],
                    success_url: actualPayload.successUrl || successUrl,
                    cancel_url: actualPayload.cancelUrl || cancelUrl,
                    metadata: { userId: req.userId, token: tokenToUse }
                },
            },
        };

        const response = await axios.post("https://api.paymongo.com/v1/checkout_sessions", payload, {
            headers: {
                Authorization: `Basic ${Buffer.from(`${payMongoSecret}:`).toString("base64")}`,
                "Content-Type": "application/json",
            }
        });

        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({ message: "Error creating checkout session", error: error.response?.data || error.message });
    }
};

// 🔥 Manages Manual Payments and fixes the "Pending" bug
export const createManualPayment = async (req, res) => {
    const { bookingId, packageId, amount, paymentType, proofImage, proofImageType, proofFileName } = req.body;

    try {
        if (!bookingId || !amount || !proofImage) {
            return res.status(400).json({ message: "Missing required manual payment fields" });
        }

        // 1. Create the Transaction as PENDING (so admin can review it)
        const transaction = await TransactionModel.create({
            userId: req.userId,
            bookingId,
            packageId,
            amount,
            paymentType: paymentType || 'Full Payment',
            paymentMethod: 'Manual',
            proofOfPayment: proofImage,
            status: 'Pending' 
        });

        // 2. Keep the Booking as 'Not Paid' until Admin approves the transaction
        await BookingModel.findByIdAndUpdate(bookingId, {
            status: 'Not Paid'
        });

        return res.status(201).json({ message: "Manual payment submitted successfully", transaction });
    } catch (error) {
        return res.status(500).json({ message: "Error processing manual payment", error: error.message });
    }
};

// 🔥 The missing webhook handler so your routes don't crash!
export const handlePayMongoWebhook = async (req, res) => {
    try {
        console.log("PayMongo Webhook triggered!");
        
        // Acknowledge the webhook to prevent PayMongo from retrying
        return res.status(200).send('Webhook received');
    } catch (error) {
        console.error('Webhook Error:', error.message);
        return res.status(500).send('Webhook Error');
    }
};