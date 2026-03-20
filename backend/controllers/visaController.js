import VisaApplicationModel from "../models/visaApplication.js";
import VisaServiceModel from "../models/visaService.js";
import UserModel from "../models/users.js";

const generateApplicationNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `APP-${timestamp}-${randomPart}`;
};

export const applyVisa = async (req, res) => {
  const { serviceId, preferredDate, purposeOfTravel } = req.body;
  const userId = req.userId;

  if (!serviceId || !preferredDate || !purposeOfTravel) {
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

    const applicantName = `${user.firstname || ""} ${user.lastname || ""}`.trim() || user.username;

    const application = await VisaApplicationModel.create({
      applicationNumber: generateApplicationNumber(),
      userId,
      serviceId,
      serviceName: service.visaName,
      applicantName,
      preferredDate,
      purposeOfTravel,
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
