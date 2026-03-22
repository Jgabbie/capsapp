import mongoose from "mongoose";

// --- Sub-Schema for Revision Comments (Negotiation History) ---
const revisionCommentSchema = new mongoose.Schema({
  comments: { type: String, required: true },
  authorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "users", 
    required: true 
  },
  authorName: { type: String, required: true },
  role: { 
    type: String, 
    enum: ["User", "Admin", "Agent"], 
    default: "User" 
  },
  createdAt: { type: Date, default: Date.now },
});

// --- Sub-Schema for PDF Revisions (Document History) ---
const pdfRevisionSchema = new mongoose.Schema({
  url: { type: String, required: true },
  version: { type: Number, required: true },
  uploadedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "users", 
    required: true 
  },
  uploaderName: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

// --- Main Quotation Schema ---
const quotationSchema = new mongoose.Schema(
  {
    packageId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "packages", 
      required: true 
    },
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "users", 
      required: true 
    },
    userName: { type: String, required: true },
    packageName: { type: String, required: true },
    travelDetails: { type: Object, required: true }, // Stores travelers, travelDate, etc.
    reference: { type: String, required: true, unique: true }, // Format: QT-XXXXXX
    status: {
      type: String,
      enum: [
        "Pending",
        "Under Review",
        "Revision Requested",
        "Revised",
        "Approved",
        "Rejected",
      ],
      default: "Pending",
    },
    currentPdfUrl: { type: String },
    pdfRevisions: [pdfRevisionSchema],
    revisionComments: [revisionCommentSchema],
  },
  { timestamps: true }
);

// Prevents model recompilation errors during development hot-reloads
const Quotation = mongoose.models.quotations || mongoose.model("quotations", quotationSchema, "quotations");

export default Quotation;