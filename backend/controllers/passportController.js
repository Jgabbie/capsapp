import PassportModel from "../models/passport.js";
import UserModel from "../models/users.js";
import logAction from "../utils/logger.js";

const randomApplicationNumber = () =>
  `APP-PASS-${Math.floor(100000000 + Math.random() * 900000000)}`;

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

    const application = await PassportModel.create({
      userId,
      username: user.username,
      dfaLocation,
      preferredDate,
      preferredTime,
      applicationType,
      applicationNumber: randomApplicationNumber(),
      status: "Application Submitted",
      submittedDocuments: {}, // Empty, since files are no longer required on creation
      documents: {} 
    });

    if (typeof logAction === 'function') {
        logAction('PASSPORT_APPLICATION_SUBMITTED', userId, { "Application Number": application.applicationNumber });
    }

    return res.status(201).json(application);
  } catch (error) {
    return res.status(500).json({ message: "Error submitting passport application", error: error.message });
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

    application.preferredDate = date;
    application.preferredTime = time;
    
    await application.save();

    return res.status(200).json({ 
        message: "Preferred schedule updated successfully", 
        application 
    });
  } catch (error) {
    return res.status(500).json({ message: "Error updating schedule", error: error.message });
  }
};