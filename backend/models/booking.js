import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    packageId: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    bookingDetails: { type: Object, required: true },
    checkoutToken: { type: String, required: true, unique: true },
    reference: { type: String, required: true, unique: true },
    status: { type: String, default: "Successful" },
  },
  { timestamps: true, collection: "bookings" }
);

const Booking = mongoose.models.bookings || mongoose.model("bookings", bookingSchema);
export default Booking;
