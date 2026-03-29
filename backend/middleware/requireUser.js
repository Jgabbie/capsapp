import mongoose from "mongoose";

const requireUser = (req, res, next) => {
  const headerUserId = req.headers["x-user-id"];
  const bodyUserId = req.body?.userId;
  const queryUserId = req.query?.userId;

  const userId = headerUserId || bodyUserId || queryUserId;

  if (!userId) {
    return res.status(401).json({ message: "User ID is required" });
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  req.userId = userId; // This is the key!
  next();
};

export default requireUser;