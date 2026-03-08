import mongoose from "mongoose";

const tokenCheckoutSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  totalPrice: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

tokenCheckoutSchema.index({ createdAt: 1 }, { expireAfterSeconds: 900 });

const TokenCheckout = mongoose.model("TokenCheckout", tokenCheckoutSchema);
export default TokenCheckout;
