import express from "express";
import requireUser from "../middleware/requireUser.js";
import requireAdmin from "../middleware/requireAdmin.js";
import {
  cancelBooking,
  createBooking,
  getAllBookings,
  getUserBookings,
} from "../controllers/bookingController.js";

const router = express.Router();

// Publicly accessible to logged-in users
router.post("/create-booking", requireUser, createBooking);
router.get("/my-bookings", requireUser, getUserBookings);

// Protected: Only Admin/Employees can see all bookings
router.get("/all-bookings", requireUser, requireAdmin, getAllBookings);

// Cancellation route
router.post("/cancel/:id", requireUser, cancelBooking);

export default router;