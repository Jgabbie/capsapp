import mongoose from "mongoose";
import Booking from "../models/booking.js";
import Cancellation from "../models/cancellation.js";
import Transaction from "../models/transaction.js";
import Package from "../models/package.js";
import User from "../models/users.js";
import TokenCheckout from "../models/tokenCheckout.js";
import dayjs from "dayjs";
import logAction from "../utils/logger.js";

// Helper to generate unique reference numbers
const generateBookingReference = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(1000 + Math.random() * 9000);
    return `BK-${timestamp}${random}`;
};

export const createBooking = async (req, res) => {
    // Extracting from root request body
    // Handle both Web format (direct fields) and Mobile format (nested in bookingPayload)
    const rawBody = req.body.bookingPayload || req.body;
    const { packageId, checkoutToken, bookingDetails, travelDate, travelers } = rawBody;
    const userId = req.userId;

    try {
        if (!packageId || !bookingDetails) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // 🔥 WEB SYNC: Format the exact shapes the Web Backend expects

        // 1. Format root travelDate as an object { startDate, endDate }
        let rootTravelDate = { startDate: "TBD", endDate: "TBD" };
        if (travelDate && travelDate.startDate) {
            rootTravelDate = travelDate; // Use provided object
        } else if (bookingDetails?.travelDate) {
            // Try parsing string "Month DD, YYYY - Month DD, YYYY"
            const dates = String(bookingDetails.travelDate).split(" - ");
            rootTravelDate = {
                startDate: dates[0] || "TBD",
                endDate: dates[1] || dates[0] || "TBD"
            };
        }


        // 3. Create the Database Record matching Web Schema
        const booking = await Booking.create({
            packageId,
            userId,
            bookingDate: bookingDetails.bookingDate || new Date().toISOString(),
            travelDate: rootTravelDate,
            travelers,
            bookingDetails: bookingDetails, // Contains the full nested objects/arrays 
            reference: generateBookingReference(),
            status: "Not Paid",
            expiresAt: dayjs().add(2, 'minutes').toDate()
        });

        logAction('CREATE_BOOKING', userId, { "Booking Created": `Reference: ${booking.reference}`, packageId });
        return res.status(201).json({ booking });
    } catch (error) {
        console.error("Create Booking Error:", error);
        return res.status(500).json({ message: "Error creating booking", error: error.message });
    }
};

export const getUserBookings = async (req, res) => {
    try {
        const userObjectId = new mongoose.Types.ObjectId(req.userId);

        const bookings = await Booking.find({ userId: userObjectId })
            .populate("packageId")
            .sort({ createdAt: -1 });

        return res.status(200).json(bookings);
    } catch (error) {
        console.error("Error fetching user bookings:", error);
        return res.status(500).json({ message: "Error fetching bookings", error: error.message });
    }
};

export const getAllBookings = async (_req, res) => {
    try {
        const bookings = await Booking.find()
            .populate("packageId")
            .populate("userId", "username email")
            .sort({ createdAt: -1 });

        return res.status(200).json(bookings);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching all bookings", error: error.message });
    }
};

export const cancelBooking = async (req, res) => {
    const { reason, comments, imageProof } = req.body;
    const userId = req.userId;

    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        if (booking.userId.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized to cancel this booking" });
        }

        if (!reason || !imageProof) {
            return res.status(400).json({ message: "Cancellation reason and image proof are required" });
        }

        booking.status = "Cancellation Requested";
        await booking.save();

        const cancellation = await Cancellation.create({
            bookingId: booking._id,
            packageId: booking.packageId,
            userId: userId,
            reference: `CN-${Math.floor(100000000 + Math.random() * 900000000)}`,
            cancellationReason: reason,
            cancellationComments: comments || '',
            cancellationDate: new Date(),
            imageProof: imageProof,
            status: 'Pending'
        });

        logAction('CANCEL_BOOKING', userId, { "Cancellation Requested": `Booking Ref: ${booking.reference}`, reason });
        return res.status(200).json({ message: "Booking cancelled", booking });
    } catch (error) {
        console.error("Cancellation Error:", error);
        return res.status(500).json({ message: "Error cancelling booking", error: error.message });
    }
};

export const getBookingByReference = async (req, res) => {
    const userId = req.userId;
    const { reference } = req.params;

    if (!reference) return res.status(400).json({ message: 'Reference is required' });

    try {
        const user = await User.findById(userId).select('role').lean();
        const isAdmin = user?.role === 'Admin' || user?.role === 'Employee';

        const booking = await Booking.findOne(isAdmin ? { reference } : { reference, userId })
            .populate('packageId', 'packageName packageType');

        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        const transactions = await Transaction.find({ bookingId: booking._id })
            .sort({ createdAt: -1 })
            .populate('packageId', 'packageName');

        return res.status(200).json({ booking, transactions });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching booking details', error: error.message });
    }
};

export const verifyTokenCheckout = async (req, res) => {
    try {
        const { token } = req.body;
        const tokenCheckout = await TokenCheckout.findOne({ token });

        if (!tokenCheckout) return res.status(400).json({ valid: false, message: 'Invalid token' });
        if (tokenCheckout.expiresAt < new Date()) return res.status(400).json({ valid: false, message: 'Token has expired' });

        return res.status(200).json({ valid: true, tokenCheckout });
    } catch (error) {
        return res.status(500).json({ valid: false, message: 'Error verifying token', error: error.message });
    }
};