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

    // Status as an array to match web
    status: {
      type: [String],
      default: ["Application Submitted"],
    },
    currentStepIndex: { type: Number, default: 0 },

    // Web Document Storage
    submittedDocuments: { type: Object },

    // Explicitly define the schedules array so Mongoose fetches it
    suggestedAppointmentSchedules: [{
      date: { type: String },
      time: { type: String }
    }],
    suggestedAppointmentScheduleChosen: {
      date: { type: String, default: "" },
      time: { type: String, default: "" }
    },
    passportReleaseOption: { type: String },
    deliveryAddress: { type: String },
    deliveryFee: { type: Number, default: 0 },
    deliveryDate: { type: String, default: "" },
    archivedAt: { type: Date, default: null },

    // Kept for mobile upload compatibility
    documents: {
      validPassport: { type: uploadedFileSchema, default: () => ({}) },
      completedVisaApplicationForm: { type: uploadedFileSchema, default: () => ({}) },
      passportSizePhoto: { type: uploadedFileSchema, default: () => ({}) },
      bankCertificateAndStatement: { type: uploadedFileSchema, default: () => ({}) },
    },
  },
  { timestamps: true, collection: "visas", strict: false }
);

const VisaApplicationModel =
  mongoose.models.visas || mongoose.model("visas", visaApplicationSchema);

export default VisaApplicationModel;