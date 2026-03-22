import mongoose from 'mongoose';

const WishlistSchema = new mongoose.Schema({
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'packages', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true }
}, { timestamps: true });

export default mongoose.model('Wishlist', WishlistSchema);