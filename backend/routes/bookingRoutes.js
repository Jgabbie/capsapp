const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const requireUser = require("../middleware/requireUser");
const requireAdmin = require("../middleware/requireAdmin");

// import express from "express";
// import requireUser from "../middleware/requireUser.js";
// import requireAdmin from "../middleware/requireAdmin.js";

// Make sure ALL of these are exported in your mobile bookingController.js!
// import {
//   createBooking,
//   cancelBooking,
//   getUserBookings,
//   getAllBookings,
//   verifyTokenCheckout,
//   getBookingsTotalBaseOnMonth,
//   getInvoiceNumber,
//   resubmitBookingDocuments
// } from "../controllers/bookingController.js";



router.post("/create-booking", requireUser, bookingController.createBooking);
router.get("/my-bookings", requireUser, bookingController.getUserBookings);
router.post("/cancel/:id", requireUser, bookingController.cancelBooking);
router.get('/bookings-total-month', requireUser, bookingController.getBookingsTotalBaseOnMonth);
router.get('/invoice-number/:reference', requireUser, bookingController.getInvoiceNumber);
router.post("/verify-payment", requireUser, bookingController.verifyTokenCheckout);
router.get("/all-bookings", requireUser, requireAdmin, bookingController.getAllBookings);
router.post('/:id/resubmit-documents', requireUser, bookingController.resubmitBookingDocuments);

module.exports = router;