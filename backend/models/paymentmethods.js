import mongoose from "mongoose";

const PaymentMethodSchema = new mongoose.Schema(
    {
        paymentType: {
            type: String,
            required: true,
        },
        number: {
            type: String,
            required: true,
        },
        accountName: {
            type: String,
            required: true,
        },
        additionalInfo: {
            type: String,
            default: "",
        },
        image: {
            type: String,
            required: false,
        },
    },
    { timestamps: true }
);

export default mongoose.model("PaymentMethod", PaymentMethodSchema);
