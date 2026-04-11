import PassportModel from "../models/passport.js";
import UserModel from "../models/users.js";

const randomApplicationNumber = () =>
  `APP-PASS-${Math.floor(100000000 + Math.random() * 900000000)}`; // Matched web generation style

// Changed to return just the URL string so the Web Admin can read it easily
const getUploadedFileUrl = (req, fieldName) => {
  const file = req.files?.[fieldName]?.[0];
  if (!file) return null;
  return `${req.protocol}://${req.get("host")}/uploads/applications/${file.filename}`;
};

export const applyPassport = async (req, res) => {
  try {
    const userId = req.userId;
    const { dfaLocation, preferredDate, preferredTime, applicationType } = req.body;

    if (!dfaLocation || !preferredDate || !preferredTime || !applicationType) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await UserModel.findById(userId).select("username");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔥 FIXED: Mapped to match Web's `submittedDocuments` structure
    const submittedDocuments = {
      birthCertificate: getUploadedFileUrl(req, "psaBirthCertificate"),
      applicationForm: getUploadedFileUrl(req, "applicationForm"),
      govId: getUploadedFileUrl(req, "validGovernmentId"),
      passportPhoto: getUploadedFileUrl(req, "passportPhoto"),
      oldPassport: getUploadedFileUrl(req, "oldPassport"),
      additionalDocs: []
    };

    const hasAllDocuments =
      submittedDocuments.passportPhoto &&
      submittedDocuments.applicationForm &&
      submittedDocuments.birthCertificate &&
      submittedDocuments.govId;

    if (!hasAllDocuments) {
      return res.status(400).json({
        message:
          "Please upload all passport requirements: 2x2 photo, application form, PSA birth certificate, and valid government ID",
      });
    }

    const isRenewApplication = String(applicationType || "").toLowerCase().includes("renew");
    if (isRenewApplication && !submittedDocuments.oldPassport) {
      return res.status(400).json({
        message: "Please upload your old passport for renew passport applications",
      });
    }

    const application = await PassportModel.create({
      userId,
      username: user.username,
      dfaLocation,
      preferredDate,
      preferredTime,
      applicationType,
      applicationNumber: randomApplicationNumber(), // 🔥 FIXED: Changed from applicationId to applicationNumber
      submittedDocuments, // 🔥 FIXED: Used the Web-friendly document object
    });

    return res.status(201).json({
      message: "Passport application submitted successfully",
      application,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const getPassportApplications = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId).select("role");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isAdmin = String(user.role || "").toLowerCase() === "admin";
    const query = isAdmin ? {} : { userId: req.userId };

    const applications = await PassportModel.find(query).sort({ createdAt: -1 });
    return res.status(200).json(applications);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// 🔥 NEW: Function to handle the user choosing a suggested appointment 🔥
export const chooseAppointment = async (req, res) => {
  const { id } = req.params;
  const { date, time } = req.body;

  try {
    if (!date || !time) {
      return res.status(400).json({ message: "Chosen appointment date and time are required" });
    }

    const application = await PassportModel.findById(id);
    if (!application) {
      return res.status(404).json({ message: "Passport application not found" });
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