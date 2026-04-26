import mongoose from "mongoose";

const cancellationSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "bookings", required: true },
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'packages' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    cancellationReason: { type: String, required: true },
    cancellationComments: { type: String, default: '' },
    imageProof: { type: String, required: true },
    cancellationDate: { type: Date, default: Date.now },
    reference: { type: String, required: true, unique: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Disapproved'], default: 'Pending' }
  },
  { timestamps: true, collection: 'cancellations' }
);

const Cancellation = mongoose.models.cancellations || mongoose.model("cancellations", cancellationSchema);
export default Cancellation;