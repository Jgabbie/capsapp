import express from "express";
import requireUser from "../middleware/requireUser.js";
import requireAdmin from "../middleware/requireAdmin.js";

// 🔥 Make sure ALL of these are exported in your mobile bookingController.js!
import {
  createBooking,
  getUserBookings,
  getAllBookings,
  verifyTokenCheckout
} from "../controllers/bookingController.js";

const router = express.Router();

// ==========================================
// 🧑‍💻 PUBLIC / USER ROUTES
// ==========================================
router.post("/create-booking", requireUser, createBooking);
router.get("/my-bookings", requireUser, getUserBookings);
router.get("/by-reference/:reference", requireUser, getBookingByReference);
router.get("/bookings-total-month", requireUser, getBookingsTotalBaseOnMonth);
router.post("/cancel/:id", requireUser, cancelBooking);
router.post("/verify-payment", requireUser, verifyTokenCheckout);

// ==========================================
// 🛡️ ADMIN / EMPLOYEE ROUTES
// ==========================================
router.get("/all-bookings", requireUser, requireAdmin, getAllBookings);
router.put("/:id", requireUser, requireAdmin, updateBooking);
router.delete("/:id", requireUser, requireAdmin, deleteBooking);

// Cancellation Management
router.get("/cancellations", requireUser, requireAdmin, getcancellations);
router.post("/cancellations/:id/approve", requireUser, requireAdmin, approveCancellation);
router.post("/cancellations/:id/reject", requireUser, requireAdmin, disApproveCancellation);

export default router;