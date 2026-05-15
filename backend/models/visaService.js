import mongoose from "mongoose";

const visaServiceSchema = new mongoose.Schema(
  {
    visaName: { type: String, required: true },
    visaPrice: { type: Number, required: true },
    visaDescription: { type: String, required: true },
    visaRequirements: { type: [Object], required: true },
    visaProcessSteps: { type: [mongoose.Schema.Types.Mixed], required: true },
    visaReminders: { type: [String], required: true }
  },
  { timestamps: true, collection: "services" }
);

const ServiceModel =
  mongoose.models.services || mongoose.model("services", visaServiceSchema);

export default ServiceModel;