import crypto from "crypto";
import axios from "axios";
import TokenCheckout from "../models/tokenCheckout.js";

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
    const { checkoutToken, totalPrice, packageName, successUrl, cancelUrl } = req.body;

    try {
        if (!checkoutToken || !totalPrice) {
            return res.status(400).json({ message: "checkoutToken and totalPrice are required" });
        }

        const tokenRecord = await TokenCheckout.findOne({ token: checkoutToken });
        if (!tokenRecord) {
            return res.status(404).json({ message: "Invalid or expired checkout token" });
        }

        const payMongoSecret = process.env.PAYMONGO_SECRET_KEY;
        if (!payMongoSecret) {
            return res.status(500).json({ message: "PAYMONGO_SECRET_KEY is not configured" });
        }

        // 🔥 WEB SYNCED COMPUTATION: 3.5% + ₱15 Fee 🔥
        const baseAmountCents = Math.round(Number(totalPrice) * 100);
        const convenienceFeeCents = Math.round((baseAmountCents * 0.035) + 1500);

        const payload = {
            data: {
                attributes: {
                    billing: {
                        name: "CapsApp User",
                        email: "capsapp@example.com",
                    },
                    line_items: [
                        {
                            name: packageName || "Tour Package",
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
                    success_url: successUrl,
                    cancel_url: cancelUrl,
                    metadata: { userId: req.userId, token: checkoutToken }
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