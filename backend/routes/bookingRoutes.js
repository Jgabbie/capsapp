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

router.post("/create-booking", requireUser, createBooking);
router.get("/my-bookings", requireUser, getUserBookings);
router.post("/verify-payment", requireUser, verifyTokenCheckout);
router.get("/all-bookings", requireUser, requireAdmin, getAllBookings);



export default router;