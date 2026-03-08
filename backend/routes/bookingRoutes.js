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

router.post("/create-booking", requireUser, createBooking);
router.get("/my-bookings", requireUser, getUserBookings);
router.get("/all-bookings", requireUser, requireAdmin, getAllBookings);
router.post("/cancel/:id", requireUser, cancelBooking);

export default router;
