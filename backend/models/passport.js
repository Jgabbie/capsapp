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
    
    status: {
      type: String,
      enum: [
        'Application submitted',
        'Application approved',
        'Payment complete',
        'Documents uploaded',
        'Documents approved',
        'Documents received',
        'Documents submitted',
        'Processing by DFA',
        'DFA approved',
        'Passport released',
        'Rejected'
      ],
      default: 'Application submitted',
    },
    
    suggestedAppointmentSchedules: [{
        date: { type: String },
        time: { type: String }
    }],
    submittedDocuments: {
        birthCertificate: { type: String },
        applicationForm: { type: String },
        govId: { type: String },
        additionalDocs: [{ type: String }]
    },

    documents: {
      passportPhoto: { type: uploadedFileSchema, default: () => ({}) },
      applicationForm: { type: uploadedFileSchema, default: () => ({}) },
      psaBirthCertificate: { type: uploadedFileSchema, default: () => ({}) },
      validGovernmentId: { type: uploadedFileSchema, default: () => ({}) },
      oldPassport: { type: uploadedFileSchema, default: () => ({}) },
    },
  },
  // 🔥 THE MAGIC FIX: Pointed collection to "passports" to match the Web App 🔥
  { timestamps: true, collection: "passports", strict: false }
);

const PassportModel =
  mongoose.models.passports || mongoose.model("passports", passportSchema);

export default PassportModel;