import mongoose from "mongoose";

const uploadedFileSchema = new mongoose.Schema(
  {
    fileName: { type: String, default: "" },
    fileUrl: { type: String, default: "" },
    mimeType: { type: String, default: "" },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const visaApplicationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "services", required: true },
    serviceName: { type: String, required: true },
    applicantName: { type: String, required: true },
    preferredDate: { type: String, required: true },
    preferredTime: { type: String, required: true },
    purposeOfTravel: { type: String, required: true },
    applicationNumber: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Approved", "Rejected"],
      default: "Pending",
    },
    documents: {
      validPassport: { type: uploadedFileSchema, default: () => ({}) },
      completedVisaApplicationForm: { type: uploadedFileSchema, default: () => ({}) },
      passportSizePhoto: { type: uploadedFileSchema, default: () => ({}) },
      bankCertificateAndStatement: { type: uploadedFileSchema, default: () => ({}) },
    },
  },
  { timestamps: true, collection: "visas" }
);

const VisaApplicationModel =
  mongoose.models.visas || mongoose.model("visas", visaApplicationSchema);

export default VisaApplicationModel;
