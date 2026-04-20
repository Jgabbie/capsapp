import mongoose from "mongoose";

const tokenCheckoutSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true }, // 🔥 Added to match web
  amount: { type: Number, required: true }, // 🔥 Changed from totalPrice to match web
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true } // 🔥 Added to match web
});

// We use "tokencheckouts" here so it perfectly syncs with the exact same collection your web backend uses!
const TokenCheckout = mongoose.models.tokencheckouts || mongoose.model("tokencheckouts", tokenCheckoutSchema);

export default TokenCheckout;