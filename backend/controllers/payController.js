import axios from "axios";
import crypto from "crypto";
import dayjs from "dayjs";
import BookingModel from "../models/booking.js";
import TransactionModel from "../models/transaction.js"; // 🔥 FIXED: Singular transaction.js
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

// 🔥 NEW: Added to handle the 400 Token Error on Mobile
export const createCheckoutToken = async (req, res) => {
    const userId = req.userId;
    const { totalPrice, bookingId } = req.body;

    try {
        const numericTotal = Number(totalPrice || 0);
        if (!numericTotal || Number.isNaN(numericTotal)) {
            return res.status(400).json({ message: "Valid totalPrice is required" });
        }

        const token = crypto.randomUUID();
        await TokenCheckoutModel.create({
            token,
            userId,
            bookingId,
            amount: numericTotal,
            totalPrice: numericTotal,
            createdAt: new Date(),
            expiresAt: dayjs().add(5, 'minutes').toDate()
        });

        return res.status(201).json({ token });
    } catch (error) {
        return res.status(500).json({ message: "Error creating checkout token", error: error.message });
    }
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
                status: 'Not Paid', // 🔥 FIXED: Override to 'Not Paid'
                bookingDetails 
            });
            finalBookingId = booking._id;
            bookingRef = booking.reference;
        } else if (bookingId) {
            const booking = await BookingModel.findById(bookingId);
            booking.status = 'Not Paid'; // 🔥 FIXED: Override to 'Not Paid'
            if (!booking.statusHistory) booking.statusHistory = [];
            booking.statusHistory.push({ status: 'Not Paid', changedAt: new Date() });
            await booking.save();
            bookingRef = booking.reference;
        }

        if (!finalBookingId) {
            return res.status(400).json({ error: "Booking ID is required to process payment." });
        }

        const token = crypto.randomUUID();
        await TokenCheckoutModel.create({
            token,
            userId,
            bookingId: finalBookingId, 
            amount: Number(amount), 
            expiresAt: dayjs().add(5, 'minutes').toDate()
        });

        // The Transaction stays 'Pending' so the Admin can verify the slip
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

export const handlePayMongoWebhook = async (req, res) => { 
    res.status(200).send('OK'); 
};