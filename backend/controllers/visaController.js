import VisaApplicationModel from "../models/visaApplication.js";
import VisaServiceModel from "../models/visaService.js";
import UserModel from "../models/users.js";

const generateApplicationNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `APP-${timestamp}-${randomPart}`;
};

const getUploadedFileMeta = (req, fieldName) => {
  const file = req.files?.[fieldName]?.[0];
  if (!file) return null;

  return {
    fileName: file.originalname,
    fileUrl: `${req.protocol}://${req.get("host")}/uploads/applications/${file.filename}`,
    mimeType: file.mimetype,
    uploadedAt: new Date(),
  };
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

    const documents = {
      validPassport: getUploadedFileMeta(req, "validPassport"),
      completedVisaApplicationForm: getUploadedFileMeta(req, "completedVisaApplicationForm"),
      passportSizePhoto: getUploadedFileMeta(req, "passportSizePhoto"),
      bankCertificateAndStatement: getUploadedFileMeta(req, "bankCertificateAndStatement"),
    };

    const hasAllDocuments =
      documents.validPassport &&
      documents.completedVisaApplicationForm &&
      documents.passportSizePhoto &&
      documents.bankCertificateAndStatement;

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
      documents,
    });

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
