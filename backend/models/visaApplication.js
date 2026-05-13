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

const visaApplicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "services",
    required: true
  },
  serviceName: { type: String, required: true },
  applicantName: { type: String, required: true },
  preferredDate: { type: String, required: true },
  preferredTime: { type: String, required: true },
  purposeOfTravel: { type: String, required: true },
  applicationNumber: { type: String, required: true, unique: true },
  suggestedAppointmentSchedules: [{
    date: { type: String },
    time: { type: String }
  }],
  suggestedAppointmentScheduleChosen: {
    date: { type: String, default: "" },
    time: { type: String, default: "" }
  },
  submittedDocuments: { type: Object },
  resubmissionTarget: { type: String, default: null },
  resubmissionTargets: [{ type: String }],
  passportReleaseOption: { type: String },
  deliveryAddress: { type: String },
  deliveryFee: { type: Number, default: 0 },
  deliveryDate: { type: String, default: "" },
  status: {
    type: [String],
    default: ["Application Submitted"],
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
  processSteps: { type: mongoose.Schema.Types.Mixed, default: {} },
  onPenalty: { type: Boolean, default: false },
  penaltyDeadline: { type: String, default: "" },
  secondDeadline: { type: String, default: "" },
  secondChance: { type: Boolean, default: false },
  reachedSecondDeadline: { type: Boolean, default: false },
  currentStepIndex: { type: Number, default: 0 },
},
  { timestamps: true, collection: "visas", strict: false });

const VisaModel =
  mongoose.models.visas || mongoose.model("visas", visaApplicationSchema);

export default VisaModel;