import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
    visaName: { type: String, required: true },
    visaPrice: { type: Number, required: true },
    visaDescription: { type: String, required: true },
    visaRequirements: { type: [Object], required: true },
    visaAdditionalRequirements: { type: [Object], required: false, default: [] },
    visaProcessSteps: { type: [String], required: true },
    visaReminders: { type: [String], required: true }
});

const Service = mongoose.models.services || mongoose.model('services', serviceSchema);

export default Service;