import mongoose from 'mongoose';

const tokenCheckoutVisaSchema = new mongoose.Schema({
    token: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'visas', required: true },
    amount: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true }
});

const TokenCheckoutVisaModel = mongoose.models.tokencheckoutvisa || mongoose.model('tokencheckoutvisa', tokenCheckoutVisaSchema);
export default TokenCheckoutVisaModel;