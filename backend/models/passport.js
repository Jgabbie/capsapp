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

const passportSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    applicationId: { type: String, unique: true, required: true },
    username: { type: String, required: true },
    dfaLocation: { type: String, required: true },
    preferredDate: { type: String, required: true },
    preferredTime: { type: String, required: true },
    applicationType: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Approved", "Rejected"],
      default: "Pending",
    },
    documents: {
      passportPhoto: { type: uploadedFileSchema, default: () => ({}) },
      applicationForm: { type: uploadedFileSchema, default: () => ({}) },
      psaBirthCertificate: { type: uploadedFileSchema, default: () => ({}) },
      validGovernmentId: { type: uploadedFileSchema, default: () => ({}) },
      oldPassport: { type: uploadedFileSchema, default: () => ({}) },
    },
  },
  { timestamps: true, collection: "passport" }
);

const PassportModel =
  mongoose.models.passport || mongoose.model("passport", passportSchema);

export default PassportModel;
