import mongoose from 'mongoose';

const RatingSchema = new mongoose.Schema({
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'packages', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
    rating: { type: Number, required: true },
    review: { type: String },
    guestName: { type: String },
    guestEmail: { type: String }
}, { timestamps: true });

const Rating = mongoose.model('ratings', RatingSchema);

export default Rating;