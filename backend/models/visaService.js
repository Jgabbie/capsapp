import mongoose from "mongoose";

const visaServiceSchema = new mongoose.Schema(
  {
    visaName: { type: String, required: true },
    visaPrice: { type: Number, required: true },
    visaDescription: { type: String, required: true },
    visaRequirements: { type: [String], default: [] },
    visaProcessSteps: { type: [String], default: [] },
    visaType: { type: String, default: "Tourist" },
  },
  { timestamps: true, collection: "services" }
);

const VisaServiceModel =
  mongoose.models.services || mongoose.model("services", visaServiceSchema);

export default VisaServiceModel;
