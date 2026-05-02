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
    applicationNumber: { type: String },
    applicationId: { type: String },
    username: { type: String, required: true },
    dfaLocation: { type: String, required: true },
    preferredDate: { type: String, required: true },
    preferredTime: { type: String, required: true },
    applicationType: { type: String, required: true },
    suggestedAppointmentSchedules: [{
      date: { type: String },
      time: { type: String }
    }],
    suggestedAppointmentScheduleChosen: {
      date: { type: String, default: "" },
      time: { type: String, default: "" }
    },
    submittedDocuments: {
      birthCertificate: { type: String },
      applicationForm: { type: String },
      photo: { type: String },
      govId: { type: String },
    },
    passportReleaseOption: { type: String },
    deliveryAddress: { type: String },
    status: {
      type: String,
      enum: [
        'Application Submitted',
        'Application Approved',
        'Payment Complete',
        'Documents Uploaded',
        'Documents Approved',
        'Documents Received',
        'Documents Submitted',
        'Processing by DFA',
        'DFA Approved',
        'Passport Released',
        'Rejected'
      ],
      default: 'Application Submitted',
    },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true, collection: "passports", strict: false });

const PassportModel =
  mongoose.models.passports || mongoose.model("passports", passportSchema);

export default PassportModel;