import mongoose from "mongoose";

const RecentTourSchema = new mongoose.Schema(
    {
        image: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("RecentTour", RecentTourSchema);