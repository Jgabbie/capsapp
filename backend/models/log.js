import mongoose from "mongoose";

const LogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true
    },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: false,
        default: null
    },
    details: {
        type: Object
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const Log = mongoose.models.logs || mongoose.model("logs", LogSchema, "logging");

export default Log;