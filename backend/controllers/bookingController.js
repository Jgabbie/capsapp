import Booking from "../models/booking.js";
import Cancellation from "../models/cancellation.js";
import Transaction from "../models/transaction.js";

// Helper to generate unique reference numbers
const generateBookingReference = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `BK-${timestamp}${random}`;
};

export const createBooking = async (req, res) => {
  const { packageId, bookingDetails, checkoutToken } = req.body;
  const userId = req.userId;

  try {
    if (!packageId || !bookingDetails || !checkoutToken) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if this specific checkout has already been processed
    const existingBooking = await Booking.findOne({ checkoutToken });
    if (existingBooking) {
      return res.status(200).json(existingBooking);
    }

    // Create the booking using the new model structure we just made
    const booking = await Booking.create({
      packageId,
      userId,
      // We extract these from bookingDetails to keep the DB flat and searchable
      bookingDate: bookingDetails.bookingDate,
      travelDate: bookingDetails.travelDate,
      travelers: bookingDetails.travelers,
      
      bookingDetails, // Keep the original object just in case
      checkoutToken,
      reference: generateBookingReference(),
      status: "Successful",
    });

    return res.status(201).json(booking);
  } catch (error) {
    console.error("Create Booking Error:", error);
    return res.status(500).json({ message: "Error creating booking", error: error.message });
  }
};

export const getUserBookings = async (req, res) => {
  try {
    // 1. Find all successful transaction IDs for this user
    const paidBookingIds = await Transaction.distinct("bookingId", {
      userId: req.userId,
      status: { $in: ["Paid", "Successful"] },
    });

    // 2. Fetch the bookings that match those transactions
    // We use .populate('packageId') so the mobile app gets the Tour Name and Image
    const bookings = await Booking.find({
      userId: req.userId,
      _id: { $in: paidBookingIds },
      status: { $ne: "Cancelled" },
    })
    .populate("packageId") 
    .sort({ createdAt: -1 });

    return res.status(200).json(bookings);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching bookings", error: error.message });
  }
};

export const getAllBookings = async (_req, res) => {
  try {
    const paidBookingIds = await Transaction.distinct("bookingId", {
      status: { $in: ["Paid", "Successful"] },
    });

    // Admin view: include user details too
    const bookings = await Booking.find({
      _id: { $in: paidBookingIds },
      status: { $ne: "Cancelled" },
    })
    .populate("packageId")
    .populate("userId", "username email")
    .sort({ createdAt: -1 });

    return res.status(200).json(bookings);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching all bookings", error: error.message });
  }
};

export const cancelBooking = async (req, res) => {
  const { reason } = req.body;

  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Security check
    if (booking.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized to cancel this booking" });
    }

    booking.status = "Cancelled";
    await booking.save();

    // Create record in the cancellation collection
    await Cancellation.create({
      bookingId: booking._id,
      userId: req.userId,
      cancellationReason: reason || "No reason provided",
    });

    return res.status(200).json({ message: "Booking cancelled", booking });
  } catch (error) {
    return res.status(500).json({ message: "Error cancelling booking", error: error.message });
  }
};