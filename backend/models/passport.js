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
      govId: { type: String },
      // photo: { type: String },
    },
    passportReleaseOption: { type: String },
    deliveryAddress: { type: String },
    status: {
      type: String,
      enum: [
        'Application Submitted',
        'Application Approved',
        'Payment Completed',
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
    statusHistory: [{
      status: { type: String },
      changedAt: { type: Date },
      changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
      changedByName: { type: String }
    }],
    deadlineWarnings: [{
      status: { type: String },
      deadlineDate: { type: String },
      warnedAt: { type: Date }
    }],
    // Process steps and computed dates for each passport workflow step.
    // Stored as an object keyed by status name, e.g.
    // { "Application Submitted": { setDate: '2026-05-10', deadlineDate: '2026-05-12' }, ... }
    processSteps: { type: mongoose.Schema.Types.Mixed, default: {} },
    onPenalty: { type: Boolean, default: false },
    penaltyDeadline: { type: String, default: "" },
    secondChance: { type: Boolean, default: false },
    secondDeadline: { type: String, default: "" },
    reachedSecondDeadline: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true, collection: "passports", strict: false });

const PassportModel =
  mongoose.models.passports || mongoose.model("passports", passportSchema);

export default PassportModel;