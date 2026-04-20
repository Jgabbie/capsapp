import axios from "axios";
import crypto from "crypto";
import dayjs from "dayjs";
import BookingModel from "../models/booking.js";
import TransactionModel from "../models/transaction.js"; 
import PackageModel from "../models/package.js";
import TokenCheckoutModel from "../models/tokenCheckout.js"; 
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

export const createManualPayment = async (req, res) => {
    const userId = req.userId; 
    try {
        const { packageId, travelDate, travelerTotal, amount, paymentType, proofImage, proofImageType, proofFileName, bookingDetails, bookingId } = req.body;

        let finalBookingId = bookingId;
        let bookingRef = "";

        // Handles Mobile's direct payload OR Web's existing bookingId
        if (!bookingId && bookingDetails) {
            const booking = await BookingModel.create({
                packageId, userId, travelDate,
                bookingDate: new Date().toISOString(),
                travelers: Number(travelerTotal),
                reference: generateBookingReference(),
                status: 'Pending',
                bookingDetails 
            });
            finalBookingId = booking._id;
            bookingRef = booking.reference;
        } else if (bookingId) {
            const booking = await BookingModel.findById(bookingId);
            booking.status = 'Pending';
            if (!booking.statusHistory) booking.statusHistory = [];
            booking.statusHistory.push({ status: 'Pending', changedAt: new Date() });
            await booking.save();
            bookingRef = booking.reference;
        }

        // 🔥 SAFETY FIX: Ensure we have a booking ID before creating tokens or transactions!
        if (!finalBookingId) {
            return res.status(400).json({ error: "Booking ID is required to process payment." });
        }

        // 1. Create Token Checkout (Web Sync)
        // This now perfectly matches your updated models/tokenCheckout.js
        const token = crypto.randomUUID();
        await TokenCheckoutModel.create({
            token,
            userId,
            bookingId: finalBookingId, 
            amount: Number(amount), 
            expiresAt: dayjs().add(5, 'minutes').toDate()
        });

        // 2. Create Transaction Record (Web Sync)
        await TransactionModel.create({
            bookingId: finalBookingId,
            packageId,
            userId,
            reference: generateTransactionReference(),
            amount: Number(amount),
            method: 'Manual',
            status: 'Pending',
            proofImage,
            proofImageType,
            proofFileName,
            paymentType
        });

        logAction('CREATE_MANUAL_PAYMENT', userId, { "Payment Uploaded": `Amount: ₱${amount} for Booking: ${bookingRef}` });
        return res.status(201).json({ 
            message: 'Success', 
            bookingId: bookingRef, 
            redirectUrl: `/booking-payment/success?token=${token}` 
        });
    } catch (error) {
        console.error('Manual payment error:', error.message);
        res.status(500).json({ error: error.message });
    }
};

export const createCheckoutSession = async (req, res) => {
    try {
        const { paymentPayload } = req.body;
        const pkg = await PackageModel.findById(paymentPayload.packageId);
        
        // 🔥 WEB SYNCED COMPUTATION: 3.5% + ₱15 Fee
        const baseAmountCents = Math.round(paymentPayload.totalPrice * 100);
        const convenienceFeeCents = Math.round((baseAmountCents * 0.035) + 1500);
        const finalTotalCents = baseAmountCents + convenienceFeeCents;

        const response = await axios.post("https://api.paymongo.com/v1/checkout_sessions", {
            data: {
                attributes: {
                    billing: { 
                        name: paymentPayload.leadEmail ? "User" : "CapsApp User",
                        email: paymentPayload.leadEmail || "capsapp@example.com" 
                    },
                    line_items: [
                        { 
                            name: pkg?.packageName || 'Tour Package', 
                            quantity: 1, 
                            amount: baseAmountCents, 
                            currency: "PHP" 
                        },
                        { 
                            name: "Convenience Fee", 
                            description: "Payment processing and service fee", 
                            quantity: 1, 
                            amount: convenienceFeeCents, 
                            currency: "PHP" 
                        }
                    ],
                    payment_method_types: ["card", "gcash", "paymaya", "grab_pay", "qrph"],
                    success_url: paymentPayload.successUrl,
                    cancel_url: paymentPayload.cancelUrl,
                    metadata: { 
                        userId: req.userId, 
                        packageId: paymentPayload.packageId,
                        // 🔥 CRITICAL: Sent to PayMongo so the Webhook knows what to update!
                        bookingId: paymentPayload.bookingId, 
                        bookingReference: paymentPayload.bookingReference,
                        transactionType: "Booking Payment", 
                        baseAmountCents,
                        convenienceFeeCents,
                        totalAmountCents: finalTotalCents
                    }
                }
            }
        }, {
            headers: { 
                Authorization: `Basic ${Buffer.from(process.env.PAYMONGO_SECRET_KEY + ":").toString("base64")}`,
                "Content-Type": "application/json"
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error("PayMongo Error:", error.response?.data || error.message);
        res.status(500).json({ error: "PayMongo Error", details: error.response?.data });
    }
};

// Webhook handler stub
export const handlePayMongoWebhook = async (req, res) => { 
    res.status(200).send('OK'); 
};