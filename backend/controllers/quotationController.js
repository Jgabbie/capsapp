import Quotation from "../models/quotation.js";
import User from "../models/users.js";
import logAction from "../utils/logger.js";


//generate unique quotation reference
const generateQuotationReference = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `QT-${timestamp}${random}`;
};


//create quotation function
const createQuotation = async (req, res) => {
  const { packageId, quotationDetails, travelDetails } = req.body;
  const userId = req.userId;

  try {
    const normalizedDetails = quotationDetails || travelDetails;

    if (!packageId || !normalizedDetails) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const quotation = await Quotation.create({
      packageId,
      userId,
      travelDetails: normalizedDetails,
      quotationDetails: normalizedDetails,
      reference: generateQuotationReference(),
      status: "Pending",
    });

    logAction('QUOTATION_CREATED', userId, { "Quotation Submitted": `Reference: ${quotation.reference}`, packageId });
    return res.status(201).json(quotation);
  } catch (error) {
    return res.status(500).json({ message: "Error creating quotation", error: error.message });
  }
};


//get all quotations for a user
const getUserQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.find({ userId: req.userId })
      .populate('packageId', 'packageName packageType packageInclusions packageExclusions packageItineraries packageItineraryImages packageRequiresVisa')
      .sort({ createdAt: -1 });
    return res.status(200).json(quotations);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching quotations", error: error.message });
  }
};


//get a single quotation by ID
const getQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id)
      .populate('packageId', 'packageName packageType packageInclusions packageExclusions packageItineraries packageItineraryImages packageRequiresVisa');

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


//request revision for a quotation function
const requestRevision = async (req, res) => {
  const { notes } = req.body;

  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) return res.status(404).json({ message: "Quotation not found" });

    // Security check
    if (quotation.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const user = await User.findById(req.userId).select("username firstname lastname email role");
    if (!user) return res.status(404).json({ message: "User not found" });

    const normalizedRole = (() => {
      const role = String(user.role || "").trim().toLowerCase();
      if (role === "admin") return "Admin";
      if (role === "employee") return "Employee";
      return "Customer";
    })();

    const authorName = user.username || `${user.firstname || ""} ${user.lastname || ""}`.trim() || user.email || "Customer";

    if (!Array.isArray(quotation.revisionComments)) {
      quotation.revisionComments = [];
    }

    quotation.status = "Revision Requested";
    quotation.revisionComments.push({
      authorId: req.userId,
      authorName,
      role: normalizedRole,
      comments: notes || "User requested a revision.",
      createdAt: new Date(),
    });

    await quotation.save();
    logAction('QUOTATION_REVISION_REQUESTED', req.userId, { quotationId: quotation._id });
    return res.status(200).json({ message: "Revision requested", quotation });
  } catch (error) {
    return res.status(500).json({ message: "Error requesting revision", error: error.message });
  }
};


//update quotation function
const updateQuotation = async (req, res) => {
  const { quotationDetails, travelDetails } = req.body;

  try {
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    if (quotation.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const normalizedDetails = quotationDetails || travelDetails;
    if (normalizedDetails) {
      quotation.quotationDetails = normalizedDetails;
      quotation.travelDetails = normalizedDetails;
    }

    await quotation.save();
    return res.status(200).json(quotation);
  } catch (error) {
    return res.status(500).json({ message: "Error updating quotation", error: error.message });
  }
};


export {
  createQuotation,
  getUserQuotations,
  getQuotation,
  requestRevision,
  updateQuotation
}