import express from "express";
import requireUser from "../middleware/requireUser.js";
import requireAdmin from "../middleware/requireAdmin.js";
import * as bookingController from "../controllers/bookingController.js";

// Make sure ALL of these are exported in your mobile bookingController.js!


const router = express.Router();

router.post("/create-booking", requireUser, bookingController.createBooking);
router.get("/booking/:reference", requireUser, bookingController.getBookingByReference);
router.get("/my-bookings", requireUser, bookingController.getUserBookings);
router.post("/cancel/:id", requireUser, bookingController.cancelBooking);
router.get('/bookings-total-month', requireUser, bookingController.getBookingsTotalBaseOnMonth);
router.get('/invoice-number/:reference', requireUser, bookingController.getInvoiceNumber);
router.post("/verify-payment", requireUser, bookingController.verifyTokenCheckout);
router.post('/:id/resubmit-documents', requireUser, bookingController.resubmitBookingDocuments);


export default router;