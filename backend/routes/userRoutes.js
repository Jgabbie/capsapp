import express from "express";
import { 
    createUser, deleteUser, getUsers, loginUser, updateUser, getUserById,
    sendResetOtp, checkResetOtp, resetPassword,
    sendVerifyOtp, verifyAccount, redirectToApp,
    updateLoginOnce // <-- ADDED THIS
} from "../controllers/userController.js"; 

// 🔥 ADDED THIS to decode the token so the backend knows WHICH user is clicking "Continue"
import requireUser from "../middleware/requireUser.js"; 

const router = express.Router();

// Existing Routes
router.post("/create-user", createUser);
router.post("/login-user", loginUser);
router.get("/get-user", getUsers);
router.delete("/delete-user/:id", deleteUser);

// Updated & New Routes for Mobile Profile
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser); 
router.put("/update-user/:id", updateUser); 

// Password Reset Routes
router.post("/auth/send-reset-otp", sendResetOtp);
router.post("/auth/check-reset-otp", checkResetOtp);
router.post("/auth/reset-password", resetPassword);

// Account Verification Routes
router.post("/auth/send-verify-otp", sendVerifyOtp);
router.post("/auth/verify-account", verifyAccount);

// Deep Link Redirect Route
router.get("/redirect-to-app", redirectToApp);

// 🔥 NEW: Route to handle completing the first-time setup
router.post("/login-once", requireUser, updateLoginOnce);

export default router;