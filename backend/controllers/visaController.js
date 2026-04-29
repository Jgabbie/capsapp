import VisaApplicationModel from "../models/visaApplication.js";
import VisaServiceModel from "../models/visaService.js";
import UserModel from "../models/users.js";
import logAction from "../utils/logger.js";

const generateApplicationNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `APP-${timestamp}-${randomPart}`;
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
      return res.status(404).json({ message: "Service not found" });
    }

    const applicantName = `${user.firstname || ""} ${user.lastname || ""}`.trim() || user.username;

    const newApplication = await VisaApplicationModel.create({
      userId,
      serviceId,
      serviceName: service.visaName,
      applicantName,
      preferredDate,
      preferredTime,
      purposeOfTravel,
      applicationNumber: generateApplicationNumber(),
      status: ["Application Submitted"],
      currentStepIndex: 0,
      submittedDocuments: {}, // Empty, just like passport
      documents: {}
    });

    if (typeof logAction === 'function') {
        logAction('VISA_APPLICATION_SUBMITTED', userId, { "Application Number": newApplication.applicationNumber });
    }

    return res.status(201).json(newApplication);
  } catch (error) {
    return res.status(500).json({ message: "Error applying for visa", error: error.message });
  }
};

 export const getUserVisaApplications = async (req, res) => {
  try {
    const userId = req.userId;
    const applications = await VisaApplicationModel.find({ userId })
      .populate("serviceId", "visaName")
      .sort({ createdAt: -1 });
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user visa applications", error: error.message });
  }
};

 export const getVisaApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await VisaApplicationModel.findById(id)
      .populate("userId", "firstname lastname username")
      .populate("serviceId", "visaName");
    if (!application) {
      return res.status(404).json({ message: "Visa application not found" });
    }
    res.status(200).json(application);
  } catch (error) {
    res.status(500).json({ message: "Error fetching visa application", error: error.message });
  }
};

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

    if (application.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized to update this application" });
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

 export const updateVisaApplicationWithDocs = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { preferredDate, preferredTime, purposeOfTravel, submittedDocuments } = req.body;

    const application = await VisaApplicationModel.findById(id);
    if (!application) {
      return res.status(404).json({ message: "Visa application not found" });
    }

    if (application.userId.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized to update this application" });
    }

    application.preferredDate = preferredDate || application.preferredDate;
    application.preferredTime = preferredTime || application.preferredTime;
    application.purposeOfTravel = purposeOfTravel || application.purposeOfTravel;
    application.submittedDocuments = submittedDocuments || application.submittedDocuments;

    await application.save();

    if (typeof logAction === 'function') {
      logAction('UPDATE_VISA_APPLICATION', userId, { "Application Number": application.applicationNumber });
    }

    res.status(200).json({ message: "Visa application updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating visa application", error: error.message });
  }
};