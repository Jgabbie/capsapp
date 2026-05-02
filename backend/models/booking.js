import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: "packages", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    bookingDate: { type: String, required: true },
    travelDate: { type: Object, required: true },
    travelers: { type: Object, required: true },
    reference: { type: String, required: true, unique: true },
    status: { type: String, default: "Pending" },
    bookingDetails: { type: Object },
    documentsResubmissionRequired: { type: Boolean, default: false },
    documentsResubmissionRequestedAt: { type: Date },
    documentsResubmissionTravelerIndexes: [{ type: Number }],
    statusHistory: [
      {
        status: { type: String },
        changedAt: { type: Date, default: Date.now }
      }
    ],
    slotDecremented: { type: Boolean, default: false },
    paymentPenaltyTotal: { type: Number, default: 0 },
    paymentPenaltyKeys: [{ type: String }],
    paymentReminderKeys: [{ type: String }],
    createdAt: { type: Date, default: Date.now, index: true },
    expiresAt: { type: Date, required: true, index: true }
  },
  { timestamps: true, collection: "bookings" }
);

// This prevents errors during hot-reloads in development
const Booking = mongoose.models.bookings || mongoose.model("bookings", bookingSchema);

export default Booking;