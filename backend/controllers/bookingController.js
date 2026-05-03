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

        const booking = await Booking.create({
            packageId,
            userId,
            bookingDate: bookingDetails.bookingDate || new Date().toISOString(),
            travelDate: rootTravelDate,
            travelers,
            bookingDetails: bookingDetails,
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

export const getBookingsTotalBaseOnMonth = async (req, res) => {
    try {
        const { reference } = req.query || {};

        // If a reference is provided, compute the invoice number for that booking
        if (reference) {
            const orClause = [{ reference }];
            if (mongoose.Types.ObjectId.isValid(reference)) {
                orClause.push({ _id: reference });
            }

            const booking = await Booking.findOne({ $or: orClause }).lean();
            if (!booking) return res.status(404).json({ message: 'Booking not found for provided reference' });

            const createdAtValue = booking.bookingDate || booking.createdAt || new Date();
            const createdAt = dayjs(createdAtValue);
            const startOfMonth = createdAt.startOf('month').toDate();
            const endOfMonth = createdAt.endOf('month').toDate();

            // Fetch bookings in the same month (by bookingDate OR createdAt) and compute sequence.
            const monthBookings = await Booking.find({
                $or: [
                    { bookingDate: { $gte: startOfMonth, $lte: endOfMonth } },
                    { createdAt: { $gte: startOfMonth, $lte: endOfMonth } }
                ]
            })
                .select('reference bookingDate createdAt')
                .lean();

            const getIdentity = (item) => String(item?._id || item?.id || item?.reference || item?.ref || '');

            const monthBookingsSorted = monthBookings
                .map(item => ({ ...item, _createdAt: item.bookingDate || item.createdAt, _identity: getIdentity(item) }))
                .filter(item => item._createdAt)
                .sort((a, b) => {
                    const t = dayjs(a._createdAt).valueOf() - dayjs(b._createdAt).valueOf();
                    if (t !== 0) return t;
                    return a._identity.localeCompare(b._identity);
                });

            let index = monthBookingsSorted.findIndex(b => String(b._id) === String(booking._id) || String(b.reference) === String(booking.reference));
            if (index < 0) {
                const curRef = String(booking.reference || booking.ref || '');
                if (curRef) index = monthBookingsSorted.findIndex(item => String(item.reference || item.ref || '') === curRef);
            }

            const sequence = index >= 0 ? index + 1 : monthBookingsSorted.length + 1;
            const monthKey = createdAt.format('MM');
            const invoiceNumber = `${monthKey}${String(sequence).padStart(2, '0')}`;

            return res.status(200).json({ invoiceNumber, sequence, month: monthKey });
        }

        // Legacy: return total bookings for current month
        const startOfMonth = dayjs().startOf('month').toDate();
        const endOfMonth = dayjs().endOf('month').toDate();
        const totalBookings = await Booking.countDocuments({ createdAt: { $gte: startOfMonth, $lte: endOfMonth } });
        return res.status(200).json({ totalBookings });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bookings total', error });
    }
};

export const getInvoiceNumber = async (req, res) => {
    const { reference } = req.params;

    try {
        if (!reference) return res.status(400).json({ message: 'Reference is required' });

        // Get the booking by reference
        const booking = await Booking.findOne({ reference }).lean();
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        // Get booking creation date (prioritize bookingDate)
        const bookingDate = booking.bookingDate || booking.createdAt;
        const createdAt = dayjs(bookingDate);
        if (!createdAt.isValid()) return res.status(400).json({ message: 'Invalid booking date' });

        // Get month key
        const monthKey = createdAt.format('MM');

        // Get all bookings in the same month and year
        const monthStart = createdAt.clone().startOf('month').toDate();
        const monthEnd = createdAt.clone().endOf('month').toDate();

        const monthBookings = await Booking.find({
            $expr: {
                $and: [
                    { $eq: [{ $month: { $ifNull: ['$bookingDate', '$createdAt'] } }, createdAt.month() + 1] },
                    { $eq: [{ $year: { $ifNull: ['$bookingDate', '$createdAt'] } }, createdAt.year()] }
                ]
            }
        }).lean();

        // Helper to get booking identity
        const getIdentity = (item) => String(item?._id || item?.id || item?.reference || item?.ref || '');

        // Sort by creation date then by identity
        const sortedBookings = monthBookings
            .map(item => ({
                ...item,
                _createdAt: item.bookingDate || item.createdAt,
                _identity: getIdentity(item)
            }))
            .sort((a, b) => {
                const timeDiff = dayjs(a._createdAt).valueOf() - dayjs(b._createdAt).valueOf();
                if (timeDiff !== 0) return timeDiff;
                return a._identity.localeCompare(b._identity);
            });

        // Find position of current booking
        let index = sortedBookings.findIndex(item => item._identity === getIdentity(booking));
        if (index < 0) {
            const currentRef = String(booking.reference || booking.ref || '');
            if (currentRef) {
                index = sortedBookings.findIndex(item => String(item.reference || item.ref || '') === currentRef);
            }
        }

        const sequence = index >= 0 ? index + 1 : sortedBookings.length + 1;
        const invoiceNumber = `${monthKey}${String(sequence).padStart(2, '0')}`;

        res.status(200).json({ invoiceNumber, reference, sequence, monthKey });
    } catch (error) {
        console.error('Error generating invoice number:', error);
        res.status(500).json({ message: 'Error generating invoice number', error: error.message });
    }
};

export const getCurrentInvoiceNumberQuotation = async (req, res) => {
    try {
        const monthBookings = await Booking.find({
            createdAt: {
                $gte: dayjs().startOf('month').toDate(),
                $lte: dayjs().endOf('month').toDate()
            }
        }).lean();
        const lastBooking = await Booking.findOne({
            createdAt: {
                $gte: dayjs().startOf('month').toDate(),
                $lte: dayjs().endOf('month').toDate()
            }
        }).sort({ createdAt: -1 });

        let sequence = 1;

        if (lastBooking?.invoiceNumber) {
            const lastSeq = parseInt(lastBooking.invoiceNumber.slice(2));
            sequence = lastSeq + 1;
        }

        const invoiceNumber = `${dayjs().format('MM')}${String(sequence).padStart(2, '0')}`;
        return res.status(200).json({ invoiceNumber });
    } catch (error) {
        console.error('Error fetching current invoice number:', error);
        return res.status(500).json({ message: 'Error fetching current invoice number', error: error.message });
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