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
    enum: ["Customer", "Admin", "Employee"], 
    required: true 
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
  travelDetails: { type: Object },
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
    travelDetails: { type: Object },
    quotationDetails: { type: Object, required: true },
    reference: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: [
        "Pending",
        "Under Review",
        "Revision Requested",
        "Booked",
        "Rejected"
      ],
      default: "Pending"
    },
    currentPdfUrl: { type: String },
    pdfRevisions: [pdfRevisionSchema],
    revisionComments: [revisionCommentSchema]
  },
  { timestamps: true }
);

// Prevents model recompilation errors during development hot-reloads
const Quotation = mongoose.models.quotations || mongoose.model("quotations", quotationSchema, "quotations");

export default Quotation;