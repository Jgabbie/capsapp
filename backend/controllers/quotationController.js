import Quotation from "../models/quotation.js";
import User from "../models/users.js";

// --- Utility: Generate QT- Reference Number ---
const generateQuotationReference = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `QT-${timestamp}${random}`;
};

// --- CLIENT: Create New Request ---
export const createQuotation = async (req, res) => {
  const { packageId, packageName, travelDetails } = req.body;
  const userId = req.userId;

  try {
    if (!packageId || !packageName || !travelDetails) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await User.findById(userId).select("username");
    if (!user) return res.status(404).json({ message: "User not found" });

    const quotation = await Quotation.create({
      packageId,
      userId,
      userName: user.username,
      packageName,
      travelDetails,
      reference: generateQuotationReference(),
      status: "Pending",
    });

    return res.status(201).json(quotation);
  } catch (error) {
    return res.status(500).json({ message: "Error creating quotation", error: error.message });
  }
};

// --- CLIENT: Fetch User's Own List ---
export const getUserQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.find({ userId: req.userId }).sort({ createdAt: -1 });
    return res.status(200).json(quotations);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching quotations", error: error.message });
  }
};

// --- CLIENT: Fetch Specific Quotation Details ---
export const getQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) return res.status(404).json({ message: "Quotation not found" });

    // Security: Ensure user only sees their own quote
    if (quotation.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    return res.status(200).json(quotation);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching quotation", error: error.message });
  }
};

// --- CLIENT: Request Revision (Add Comments) ---
export const requestRevision = async (req, res) => {
  const { notes } = req.body;

  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) return res.status(404).json({ message: "Quotation not found" });

    // Security check
    if (quotation.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const user = await User.findById(req.userId).select("username role");

    quotation.status = "Revision Requested";
    quotation.revisionComments.push({
      authorId: req.userId,
      authorName: user.username,
      role: user.role,
      comments: notes || "User requested a revision.",
      createdAt: new Date(),
    });

    await quotation.save();
    return res.status(200).json({ message: "Revision requested", quotation });
  } catch (error) {
    return res.status(500).json({ message: "Error requesting revision", error: error.message });
  }
};

// --- ADMIN: Fetch All Global Quotations ---
export const getAllQuotations = async (_req, res) => {
  try {
    const quotations = await Quotation.find({}).sort({ createdAt: -1 });
    return res.status(200).json(quotations);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching quotations", error: error.message });
  }
};

// --- ADMIN: Fetch Specific Quotation (No User Check) ---
export const adminGetQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    return res.status(200).json(quotation);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching quotation", error: error.message });
  }
};

// --- ADMIN: Update Status (Approve/Reject) ---
export const adminUpdateQuotationStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) return res.status(404).json({ message: "Quotation not found" });

    quotation.status = status;
    await quotation.save();

    return res.status(200).json({ message: `Quotation set to ${status}`, quotation });
  } catch (error) {
    return res.status(500).json({ message: "Error updating status", error: error.message });
  }
};

// --- ADMIN: Upload Revised PDF ---
export const adminUploadQuotationPdf = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No PDF file uploaded" });

    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) return res.status(404).json({ message: "Quotation not found" });

    const admin = await User.findById(req.userId).select("username");
    
    // Construct the URL for the mobile app to access
    const pdfUrl = `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;

    quotation.currentPdfUrl = pdfUrl;
    quotation.status = "Under Review";
    quotation.pdfRevisions.push({
      url: pdfUrl,
      version: (quotation.pdfRevisions?.length || 0) + 1,
      uploadedBy: req.userId,
      uploaderName: admin?.username || "Admin",
      uploadedAt: new Date(),
    });

    await quotation.save();
    return res.status(200).json({ message: "PDF revision uploaded", quotation });
  } catch (error) {
    return res.status(500).json({ message: "Error uploading PDF", error: error.message });
  }
};

// --- CLIENT: General Update (If needed for travel details) ---
export const updateQuotation = async (req, res) => {
  const { status, travelDetails } = req.body;

  try {
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    if (quotation.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (status) quotation.status = status;
    if (travelDetails) quotation.travelDetails = travelDetails;

    await quotation.save();
    return res.status(200).json(quotation);
  } catch (error) {
    return res.status(500).json({ message: "Error updating quotation", error: error.message });
  }
};