import axios from "axios";
import BookingModel from "../models/booking.js";
import TransactionModel from "../models/transaction.js"; // Make sure this matches your singular model name
import PackageModel from "../models/package.js";

const generateBookingReference = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(1000 + Math.random() * 9000);
    return `BK-${timestamp}${random}`;
};

// 🔥 THIS IS THE FUNCTION THAT WAS MISSING! 🔥
const generateTransactionReference = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(1000 + Math.random() * 9000);
    return `TX-${timestamp}${random}`;
};

export const createManualPayment = async (req, res) => {
    const userId = req.userId; // Provided by requireUser.js
    try {
        const { packageId, travelDate, travelerTotal, amount, paymentType, proofImage, bookingDetails } = req.body;

        const booking = await BookingModel.create({
            packageId, userId, travelDate,
            bookingDate: new Date().toISOString(),
            travelers: Number(travelerTotal),
            reference: generateBookingReference(),
            status: 'Pending',
            bookingDetails 
        });

        await TransactionModel.create({
            bookingId: booking._id, packageId, userId,
            reference: generateTransactionReference(), // It needs the function here
            amount: Number(amount),
            method: 'Manual',
            status: 'Pending',
            proofImage,
            paymentType
        });

        return res.status(201).json({ message: 'Success', bookingId: booking.reference });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createCheckoutSession = async (req, res) => {
    try {
        const { paymentPayload } = req.body;
        const pkg = await PackageModel.findById(paymentPayload.packageId);
        
        const baseAmountCents = Math.round(paymentPayload.totalPrice * 100);
        const convenienceFeeCents = Math.round((baseAmountCents * 0.035) + 1500);

        const response = await axios.post("https://api.paymongo.com/v1/checkout_sessions", {
            data: {
                attributes: {
                    billing: { email: paymentPayload.leadEmail },
                    line_items: [
                        { name: pkg?.packageName || 'Tour Package', quantity: 1, amount: baseAmountCents, currency: "PHP" },
                        { name: "Convenience Fee", quantity: 1, amount: convenienceFeeCents, currency: "PHP" }
                    ],
                    payment_method_types: ["card", "gcash", "paymaya"],
                    success_url: paymentPayload.successUrl,
                    cancel_url: paymentPayload.cancelUrl,
                    metadata: { userId: req.userId, packageId: paymentPayload.packageId }
                }
            }
        }, {
            headers: { Authorization: `Basic ${Buffer.from(process.env.PAYMONGO_SECRET_KEY + ":").toString("base64")}` }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "PayMongo Error" });
    }
};

export const handlePayMongoWebhook = async (req, res) => { res.status(200).send('OK'); };