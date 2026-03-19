import express from "express";
import { 
    createUser, deleteUser, getUsers, loginUser, updateUser, 
    sendResetOtp, checkResetOtp, resetPassword,
    sendVerifyOtp, verifyAccount 
} from "../controllers/userController.js"; 

const router = express.Router();

// Existing Routes
router.post("/create-user", createUser);
router.post("/login-user", loginUser);
router.get("/get-user", getUsers);
router.delete("/delete-user/:id", deleteUser);
router.put("/update-user/:id", updateUser);

// Password Reset Routes
router.post("/auth/send-reset-otp", sendResetOtp);
router.post("/auth/check-reset-otp", checkResetOtp);
router.post("/auth/reset-password", resetPassword);

// Account Verification Routes
router.post("/auth/send-verify-otp", sendVerifyOtp);
router.post("/auth/verify-account", verifyAccount);

export default router;