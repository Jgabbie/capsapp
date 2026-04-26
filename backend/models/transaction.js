import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "bookings", required: false },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'passports', required: false }, 
    applicationType: { type: String, required: false }, 
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: "packages", required: false }, 
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    reference: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    method: { type: String, required: true },
    status: { type: String, required: true },
    proofImage: { type: String },
    proofImageType: { type: String },
    proofFileName: { type: String },
    paymentType: { type: String },
    packageName: { type: String, required: false }, 
  },
  { timestamps: true, collection: 'transactions' }
);

const Transaction = mongoose.models.transactions || mongoose.model("transactions", transactionSchema);
export default Transaction;