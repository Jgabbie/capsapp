import mongoose from "mongoose";

const AuditSchema = new mongoose.Schema({
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

// Using a fallback to prevent overwrite errors during hot-reloads
const Audit = mongoose.models.auditing || mongoose.model('auditing', AuditSchema, 'auditing');

export default Audit;