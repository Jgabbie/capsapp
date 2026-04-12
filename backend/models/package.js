import mongoose from "mongoose";

const PackageSchema = new mongoose.Schema({
    packageName: { type: String, required: true },
    packageCode: { type: String, required: true, unique: true },
    packagePricePerPax: { type: Number, required: true },
    packageSoloRate: { type: Number, default: 0 },
    packageChildRate: { type: Number, default: 0 },
    packageInfantRate: { type: Number, default: 0 },
    packageDeposit: { type: Number, default: 0 },
    packageDuration: { type: Number, required: true },
    packageDescription: { type: String, required: true },
    packageType: { type: String, required: true },
    packageSpecificDate: { type: Array, default: [] },
    packageHotels: { type: Array, default: [] },
    packageAirlines: { type: Array, default: [] },
    packageAddons: { type: Object, default: {} },
    packageInclusions: { type: Array, default: [] },
    packageExclusions: { type: Array, default: [] },
    packageTermsConditions: { type: Array, default: [] },
    packageItineraries: { type: Object, default: {} },
    packageTags: { type: Array, default: [] },
    packageDiscountPercent: { type: Number, default: 0 },
    images: { type: Array, default: [] },
}, { timestamps: true, collection: "packages", strict: false });

const PackageModel = mongoose.models.packages || mongoose.model("packages", PackageSchema);

export default PackageModel;