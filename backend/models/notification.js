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
    metadata: { type: Object, default: {} }
}, { timestamps: true });

const Notification = mongoose.model('notifications', NotificationSchema);
export default Notification;