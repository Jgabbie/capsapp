import mongoose from "mongoose";

const cancellationSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    cancellationReason: { type: String, default: "No reason provided" },
    cancellationDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Cancellation = mongoose.model("Cancellation", cancellationSchema);
export default Cancellation;
