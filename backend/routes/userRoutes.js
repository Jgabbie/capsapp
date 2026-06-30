import express from "express";
import * as userController from "../controllers/userController.js";
import requireUser from "../middleware/requireUser.js";

const router = express.Router();

router.post("/create-user", userController.createUser);
router.post("/login-user", userController.loginUser);
router.get("/get-user", userController.getUsers);
router.get("/check-phone/:phonenum", userController.checkPhoneNumberExists);
router.get("/users/:id", userController.getUserById);
router.put("/users/:id", userController.updateUser);
router.put("/update-user/:id", userController.updateUser);
router.post("/auth/send-reset-otp", userController.sendResetOtp);
router.post("/auth/check-reset-otp", userController.checkResetOtp);
router.post("/auth/reset-password", userController.resetPassword);
router.post("/auth/send-verify-otp", userController.sendVerifyOtp);
router.post("/auth/verify-account", userController.verifyAccount);
router.get("/auth/verify-email", userController.verifyEmailLink);
router.post("/auth/send-login-otp", userController.sendLoginOtp);
router.post("/auth/verify-login-otp", userController.verifyLoginOtp);
router.get("/redirect-to-app", userController.redirectToApp);
router.post("/login-once", requireUser, userController.updateLoginOnce);

export default router;