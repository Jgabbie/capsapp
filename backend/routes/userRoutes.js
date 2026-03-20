import express from "express";
import { 
    createUser, deleteUser, getUsers, loginUser, updateUser, getUserById,
    sendResetOtp, checkResetOtp, resetPassword,
    sendVerifyOtp, verifyAccount 
} from "../controllers/userController.js"; 

const router = express.Router();

// Existing Routes
router.post("/create-user", createUser);
router.post("/login-user", loginUser);
router.get("/get-user", getUsers);
router.delete("/delete-user/:id", deleteUser);

// Updated & New Routes for Mobile Profile
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser); // Mobile app uses this
router.put("/update-user/:id", updateUser); // Keep original just in case web relies on it

// Password Reset Routes
router.post("/auth/send-reset-otp", sendResetOtp);
router.post("/auth/check-reset-otp", checkResetOtp);
router.post("/auth/reset-password", resetPassword);

// Account Verification Routes
router.post("/auth/send-verify-otp", sendVerifyOtp);
router.post("/auth/verify-account", verifyAccount);

export default router;