import Booking from "../models/booking.js";
import Cancellation from "../models/cancellation.js";
import Transaction from "../models/transaction.js";

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

    const existingBooking = await Booking.findOne({ checkoutToken });
    if (existingBooking) {
      return res.status(200).json(existingBooking);
    }

    const booking = await Booking.create({
      packageId: String(packageId),
      userId,
      bookingDetails,
      checkoutToken,
      reference: generateBookingReference(),
      status: "Successful",
    });

    return res.status(201).json(booking);
  } catch (error) {
    return res.status(500).json({ message: "Error creating booking", error: error.message });
  }
};

export const getUserBookings = async (req, res) => {
  try {
    const paidBookingIds = await Transaction.distinct("bookingId", {
      userId: req.userId,
      status: { $in: ["Paid", "Successful"] },
    });

    const bookings = await Booking.find({
      userId: req.userId,
      _id: { $in: paidBookingIds },
      status: { $ne: "Cancelled" },
    }).sort({ createdAt: -1 });

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

    const bookings = await Booking.find({
      _id: { $in: paidBookingIds },
      status: { $ne: "Cancelled" },
    }).sort({ createdAt: -1 });

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

    if (booking.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized to cancel this booking" });
    }

    booking.status = "Cancelled";
    await booking.save();

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
