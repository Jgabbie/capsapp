import User from "../models/users.js";

const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("role");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (String(user.role || "").toLowerCase() !== "admin") {
      return res.status(403).json({ message: "Admins only" });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: "Authorization check failed", error: error.message });
  }
};

export default requireAdmin;
