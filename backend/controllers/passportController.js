import PassportModel from "../models/passport.js";
import UserModel from "../models/users.js";

const randomApplicationNumber = () =>
  `APP-${Math.random().toString(36).slice(2, 11).toUpperCase()}`;

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
      applicationId: randomApplicationNumber(),
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
