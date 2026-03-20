import mongoose from "mongoose";

const visaApplicationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "services", required: true },
    serviceName: { type: String, required: true },
    applicantName: { type: String, required: true },
    preferredDate: { type: String, required: true },
    purposeOfTravel: { type: String, required: true },
    applicationNumber: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true, collection: "visas" }
);

const VisaApplicationModel =
  mongoose.models.visas || mongoose.model("visas", visaApplicationSchema);

export default VisaApplicationModel;
