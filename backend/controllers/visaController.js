import VisaApplicationModel from "../models/visaApplication.js";
import VisaServiceModel from "../models/visaService.js";
import UserModel from "../models/users.js";
import logAction from "../utils/logger.js";

const generateApplicationNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `APP-${timestamp}-${randomPart}`;
};

// 🔥 FIXED: Return simple string URLs for the Web Admin
const getUploadedFileUrl = (req, fieldName) => {
  const file = req.files?.[fieldName]?.[0];
  if (!file) return null;
  return `${req.protocol}://${req.get("host")}/uploads/applications/${file.filename}`;
};

export const applyVisa = async (req, res) => {
  const { serviceId, preferredDate, preferredTime, purposeOfTravel } = req.body;
  const userId = req.userId;

  if (!serviceId || !preferredDate || !preferredTime || !purposeOfTravel) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const user = await UserModel.findById(userId).select("firstname lastname username");
    const service = await VisaServiceModel.findById(serviceId).select("visaName");

    if (!service) {
      return res.status(404).json({ message: "Visa service not found" });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔥 FIXED: Format as simple URLs for the Web backend
    const submittedDocuments = {
      validPassport: getUploadedFileUrl(req, "validPassport"),
      completedVisaApplicationForm: getUploadedFileUrl(req, "completedVisaApplicationForm"),
      passportSizePhoto: getUploadedFileUrl(req, "passportSizePhoto"),
      bankCertificateAndStatement: getUploadedFileUrl(req, "bankCertificateAndStatement"),
    };

    const hasAllDocuments =
      submittedDocuments.validPassport &&
      submittedDocuments.completedVisaApplicationForm &&
      submittedDocuments.passportSizePhoto &&
      submittedDocuments.bankCertificateAndStatement;

    if (!hasAllDocuments) {
      return res.status(400).json({
        message:
          "Please upload all visa requirements: valid passport, completed visa application form, recent passport-size photo, and bank certificate/statement",
      });
    }

    const applicantName = `${user.firstname || ""} ${user.lastname || ""}`.trim() || user.username;

    const application = await VisaApplicationModel.create({
      applicationNumber: generateApplicationNumber(),
      userId,
      serviceId,
      serviceName: service.visaName,
      applicantName,
      preferredDate,
      preferredTime,
      purposeOfTravel,
      submittedDocuments, 
    });

    logAction('APPLY_VISA', userId, { "Visa Application Created": `Application Number: ${application.applicationNumber}` });
    return res.status(201).json({
      message: "Visa application submitted successfully",
      application,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error creating visa application", error: error.message });
  }
};

export const getVisaApplications = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId).select("role");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isAdmin = String(user.role || "").toLowerCase() === "admin";
    const query = isAdmin ? {} : { userId: req.userId };

    const applications = await VisaApplicationModel.find(query)
      .populate("userId", "firstname lastname username")
      .populate("serviceId", "visaName")
      .sort({ createdAt: -1 });

    return res.status(200).json(applications);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching visa applications", error: error.message });
  }
};

// 🔥 NEW: Function to handle the user choosing a suggested appointment for Visa 🔥
export const chooseAppointment = async (req, res) => {
  const { id } = req.params;
  const { date, time } = req.body;

  try {
    if (!date || !time) {
      return res.status(400).json({ message: "Chosen appointment date and time are required" });
    }

    const application = await VisaApplicationModel.findById(id);
    if (!application) {
      return res.status(404).json({ message: "Visa application not found" });
    }

    // Update the preferred date and time with the selected option
    application.preferredDate = date;
    application.preferredTime = time;
    
    await application.save();

    return res.status(200).json({ 
        message: "Preferred appointment schedule updated", 
        application 
    });
  } catch (error) {
    console.error("Error updating preferred appointment schedule:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};