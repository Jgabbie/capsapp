import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    firstname: { type: String, default: "" },
    lastname: { type: String, default: "" },
    email: { type: String, required: true, unique: true },
    hashedPassword: { type: String, default: "" },
    phone: { type: String, default: "" },
    profileImage: { type: String, default: "" },
    homeAddress: { type: String, default: "" },
    gender: { type: String, default: "" },
    birthdate: { type: String, default: "" },
    nationality: { type: String, default: "" },
    role: { type: String, default: "Customer" },
    verifyOtp: { type: String, default: "" },
    verifyOtpExpireAt: { type: Number, default: 0 },
    isAccountVerified: { type: Boolean, default: false },
    emailVerifyOtp: { type: String, default: '' },
    emailVerifyExpireAt: { type: Number, default: 0 },
    resetOtp: { type: String, default: "" },
    resetOtpExpireAt: { type: Number, default: 0 },
    resetOtpAttempts: { type: Number, default: 0 },
    resetOtpBlockedUntil: { type: Number, default: 0 },
    resetEmailOtp: { type: String, default: '' },
    resetEmailOtpExpireAt: { type: Number, default: 0 },
    resetEmailOtpAttempts: { type: Number, default: 0 },
    resetEmailOtpBlockedUntil: { type: Number, default: 0 },
    otpAttempts: { type: Number, default: 0 },
    otpBlockedUntil: { type: Number, default: null },
    refreshToken: { type: String, default: "" },
    loginOnce: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    loginAttempts: { type: Number, default: 0 },
    loginBlockedUntil: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
    expoPushTokens: { type: [String], default: [], },
}, { strict: false });

// ES module export
const User = mongoose.models.users || mongoose.model("users", userSchema, "users");
export default User;