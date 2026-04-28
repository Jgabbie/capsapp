import crypto from "crypto";
import axios from "axios";
import dayjs from "dayjs";
import TokenCheckout from "../models/tokenCheckout.js";
import BookingModel from "../models/booking.js";       
import TransactionModel from "../models/transaction.js"; 
import PackageModel from "../models/package.js"; 
import logAction from "../utils/logger.js";

const generateBookingReference = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(1000 + Math.random() * 9000);
    return `BK-${timestamp}${random}`;
};

const generateTransactionReference = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(1000 + Math.random() * 9000);
    return `TX-${timestamp}${random}`;
};

export const createCheckoutToken = async (req, res) => {
    const userId = req.userId;
    const { totalPrice, bookingId } = req.body;

    try {
        const numericTotal = Number(totalPrice || 0);
        if (!numericTotal || Number.isNaN(numericTotal)) {
            return res.status(400).json({ message: "Valid totalPrice is required" });
        }

        const token = crypto.randomUUID();

        await TokenCheckout.create({
            token,
            userId,
            bookingId, 
            amount: numericTotal, 
            totalPrice: numericTotal, 
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes expiry
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

        // Web Synced Computation: 3.5% + ₱15 Fee
        const baseAmountCents = Math.round(Number(priceToUse) * 100);
        const convenienceFeeCents = Math.round((baseAmountCents * 0.035) + 1500);
        const finalTotalCents = baseAmountCents + convenienceFeeCents;

        const payload = {
            data: {
                attributes: {
                    billing: {
                        name: actualPayload.leadEmail ? "User" : "CapsApp User",
                        email: actualPayload.leadEmail || "capsapp@example.com",
                    },
                    line_items: [
                        { name: pkgName, quantity: 1, amount: baseAmountCents, currency: "PHP" },
                        { name: "Convenience Fee", description: "Payment processing and service fee", quantity: 1, amount: convenienceFeeCents, currency: "PHP" }
                    ],
                    payment_method_types: ["card", "gcash", "grab_pay", "paymaya", "qrph"],
                    success_url: actualPayload.successUrl || successUrl,
                    cancel_url: actualPayload.cancelUrl || cancelUrl,
                    metadata: { 
                        userId: req.userId, 
                        token: tokenToUse,
                        packageId: actualPayload.packageId,
                        bookingId: actualPayload.bookingId, 
                        bookingReference: actualPayload.bookingReference,
                        transactionType: "Booking Payment", 
                        baseAmountCents,
                        convenienceFeeCents,
                        totalAmountCents: finalTotalCents
                    }
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

export const createManualPayment = async (req, res) => {
    const userId = req.userId; 
    try {
        const { packageId, travelDate, travelerTotal, amount, paymentType, proofImage, proofImageType, proofFileName, bookingDetails, bookingId } = req.body;

        let finalBookingId = bookingId;
        let bookingRef = "";

        // Handles creating the booking on the fly (Web compatibility) OR updating an existing one (Mobile)
        if (!bookingId && bookingDetails) {
            const booking = await BookingModel.create({
                packageId, userId, travelDate,
                bookingDate: new Date().toISOString(),
                travelers: travelerTotal ? Number(travelerTotal) : 1,
                reference: generateBookingReference(),
                status: 'Not Paid', 
                bookingDetails 
            });
            finalBookingId = booking._id;
            bookingRef = booking.reference;
        } else if (bookingId) {
            const booking = await BookingModel.findById(bookingId);
            if (booking) {
                booking.status = 'Not Paid'; 
                if (!booking.statusHistory) booking.statusHistory = [];
                booking.statusHistory.push({ status: 'Not Paid', changedAt: new Date() });
                await booking.save();
                bookingRef = booking.reference;
            }
        }

        if (!finalBookingId) {
            return res.status(400).json({ error: "Booking ID is required to process payment." });
        }

        const token = crypto.randomUUID();
        await TokenCheckout.create({
            token,
            userId,
            bookingId: finalBookingId, 
            amount: Number(amount), 
            expiresAt: dayjs().add(5, 'minutes').toDate()
        });

        const transaction = await TransactionModel.create({
            bookingId: finalBookingId,
            packageId,
            userId,
            reference: generateTransactionReference(),
            amount: Number(amount),
            paymentType: paymentType || 'Full Payment',
            paymentMethod: 'Manual',
            proofOfPayment: proofImage, // Accommodating both naming conventions
            proofImage: proofImage, 
            proofImageType,
            proofFileName,
            status: 'Pending', 
        });

        if (typeof logAction === 'function') {
            logAction('CREATE_MANUAL_PAYMENT', userId, { "Payment Uploaded": `Amount: ₱${amount} for Booking: ${bookingRef}` });
        }

        return res.status(201).json({ 
            message: 'Manual payment submitted successfully', 
            transaction,
            bookingId: bookingRef, 
            reference: bookingRef, 
            redirectUrl: `/booking-payment/success?token=${token}` 
        });
    } catch (error) {
        console.error('Manual payment error:', error.message);
        return res.status(500).json({ error: error.message, message: "Error processing manual payment" });
    }
};

export const handlePayMongoWebhook = async (req, res) => {
    try {
        console.log("PayMongo Webhook triggered!");
        return res.status(200).send('Webhook received');
    } catch (error) {
        console.error('Webhook Error:', error.message);
        return res.status(500).send('Webhook Error');
    }
};