import mongoose from "mongoose";

const faqSchema = new mongoose.Schema(
    {
        question: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },

        answer: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("FAQ", faqSchema);