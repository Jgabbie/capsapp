import mongoose from "mongoose";

const preferrencesSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true, unique: true },
        moods: { type: [String], default: [] },
        tours: { type: [String], default: [] },
        pace: { type: [String], default: [] }
    },
    { timestamps: true }
);

const Preferrences = mongoose.models.preferrences || mongoose.model("preferrences", preferrencesSchema);

export default Preferrences;