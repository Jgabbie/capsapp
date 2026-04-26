import mongoose from 'mongoose';

const tokenCheckoutPassportSchema = new mongoose.Schema({
    token: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'passports', required: true },
    amount: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true }
});

const TokenCheckoutPassportModel = mongoose.models.tokencheckoutpassport || mongoose.model('tokencheckoutpassport', tokenCheckoutPassportSchema);
export default TokenCheckoutPassportModel;