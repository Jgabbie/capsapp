import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
        index: true
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: { type: String, default: 'general' },
    link: { type: String, default: '' },
    isRead: { type: Boolean, default: false },
    metadata: { type: Object, default: {} },
    pushStatus: {
        type: String,
        enum: [
            "pending",
            "sending",
            "sent",
            "failed",
        ],
        default: "pending",
    },

    pushAttempts: {
        type: Number,
        default: 0,
    },

    pushSentAt: {
        type: Date,
        default: null,
    },

    pushClaimedAt: {
        type: Date,
        default: null,
    },

    pushLastError: {
        type: String,
        default: null,
    },

    pushTickets: {
        type: [mongoose.Schema.Types.Mixed],
        default: [],
    },
}, { timestamps: true });

const Notification = mongoose.model('notifications', NotificationSchema);
export default Notification;