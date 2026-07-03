import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
    {
        visaName: { type: String, required: true },
        visaPrice: { type: Number, required: true },
        visaImage: { type: String, required: false },
        visaDescription: { type: String, required: true },
        visaRequirements: { type: [Object], required: true },
        visaProcessSteps: { type: [mongoose.Schema.Types.Mixed], required: true },
        visaReminders: { type: [String], required: true }
    },
    { timestamps: true, collection: "services" }
);

const ServiceModel = mongoose.models.services || mongoose.model('services', serviceSchema);

export default ServiceModel;