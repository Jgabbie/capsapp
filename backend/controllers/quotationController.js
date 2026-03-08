import Quotation from "../models/quotation.js";
import User from "../models/users.js";

const generateQuotationReference = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `QT-${timestamp}${random}`;
};

export const createQuotation = async (req, res) => {
  const { packageId, packageName, travelDetails } = req.body;
  const userId = req.userId;

  try {
    if (!packageId || !packageName || !travelDetails) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await User.findById(userId).select("username role");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const quotation = await Quotation.create({
      packageId: String(packageId),
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

export const getUserQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.find({ userId: req.userId }).sort({ createdAt: -1 });
    return res.status(200).json(quotations);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching quotations", error: error.message });
  }
};

export const getAllQuotations = async (_req, res) => {
  try {
    const quotations = await Quotation.find({}).sort({ createdAt: -1 });
    return res.status(200).json(quotations);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching quotations", error: error.message });
  }
};

export const getQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    if (quotation.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    return res.status(200).json(quotation);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching quotation", error: error.message });
  }
};

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

export const requestRevision = async (req, res) => {
  const { notes } = req.body;

  try {
    const quotation = await Quotation.findById(req.params.id);
    const user = await User.findById(req.userId).select("username role");

    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (quotation.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    quotation.status = "Revision Requested";
    quotation.revisionComments.push({
      authorId: req.userId,
      authorName: user.username,
      role: user.role,
      comments: notes || "Requested revision",
      createdAt: new Date(),
    });

    await quotation.save();
    return res.status(200).json({ message: "Revision requested successfully", quotation });
  } catch (error) {
    return res.status(500).json({ message: "Error requesting revision", error: error.message });
  }
};

export const adminUpdateQuotationStatus = async (req, res) => {
  const { status } = req.body;

  try {
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    quotation.status = status;
    await quotation.save();

    return res.status(200).json({ message: "Quotation status updated", quotation });
  } catch (error) {
    return res.status(500).json({ message: "Error updating quotation status", error: error.message });
  }
};

export const adminUploadQuotationPdf = async (req, res) => {
  const { pdfUrl } = req.body;

  try {
    const file = req.file;
    let resolvedPdfUrl = (pdfUrl || "").trim();

    if (file) {
      resolvedPdfUrl = `${req.protocol}://${req.get("host")}/uploads/quotations/${file.filename}`;
    }

    if (!resolvedPdfUrl) {
      return res.status(400).json({ message: "A PDF file or pdfUrl is required" });
    }

    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    const user = req.userId ? await User.findById(req.userId).select("username") : null;
    const uploaderName = user?.username || "Admin";
    const uploadedBy = req.userId || quotation.userId;

    quotation.currentPdfUrl = resolvedPdfUrl;
    quotation.status = "Under Review";
    quotation.pdfRevisions.push({
      url: resolvedPdfUrl,
      version: (quotation.pdfRevisions?.length || 0) + 1,
      uploadedBy,
      uploaderName,
      uploadedAt: new Date(),
    });

    await quotation.save();

    return res.status(200).json({ message: "Quotation PDF revision saved", quotation });
  } catch (error) {
    return res.status(500).json({ message: "Error uploading quotation PDF", error: error.message });
  }
};
