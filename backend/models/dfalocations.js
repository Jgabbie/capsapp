import mongoose from "mongoose";

const dfaLocationSchema = new mongoose.Schema(
    {
        location: {
            type: String,
            required: true,
            unique: true,
            trim: true
        }
    },
    {
        timestamps: true
    });

export default mongoose.model("DfaLocation", dfaLocationSchema);