import express from "express";
import requireUser from "../middleware/requireUser.js";
import requireAdmin from "../middleware/requireAdmin.js";

// 🔥 Make sure ALL of these are exported in your mobile bookingController.js!
import {
  createBooking,
  cancelBooking,
  getUserBookings,
  getAllBookings,
  verifyTokenCheckout,
  getBookingsTotalBaseOnMonth,
  getInvoiceNumber,
  getCurrentInvoiceNumberQuotation
} from "../controllers/bookingController.js";

const router = express.Router();

router.post("/create-booking", requireUser, createBooking);
router.get("/my-bookings", requireUser, getUserBookings);
router.post("/cancel/:id", requireUser, cancelBooking);
router.get('/bookings-total-month', requireUser, getBookingsTotalBaseOnMonth);
router.get('/current-invoice-number', requireUser, getCurrentInvoiceNumberQuotation);
router.get('/invoice-number/:reference', requireUser, getInvoiceNumber);
router.post("/verify-payment", requireUser, verifyTokenCheckout);
router.get("/all-bookings", requireUser, requireAdmin, getAllBookings);



export default router;