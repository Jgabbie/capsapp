import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    firstname: {
        type: String,
        default: ""
    },
    lastname: {
        type: String,
        default: ""
    },
    phone: {
        type: String,
        default: ""
    },
    phonenum: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        default: ""
    },
    hashedPassword: {
        type: String,
        default: ""
    },
    profileImage: {
        type: String,
        default: ""
    },
    homeAddress: {
        type: String,
        default: ""
    },
    gender: {
        type: String,
        default: ""
    },
    birthdate: {
        type: String,
        default: ""
    },
    nationality: {
        type: String,
        default: ""
    },
    role: {
        type: String,
        default: "Customer" // 🔥 CHANGED FROM "Users" TO "Customer"
    },
    verifyOtp: {
        type: String,
        default: ""
    },
    verifyOtpExpireAt: {
        type: Number,
        default: 0
    },
    isAccountVerified: {
        type: Boolean,
        default: false
    },
    resetOtp: {
        type: String,
        default: ""
    },
    resetOtpExpireAt: {
        type: Number,
        default: 0
    },
    refreshToken: {
        type: String,
        default: ""
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { strict: false });

// ES module export
const User = mongoose.models.users || mongoose.model("users", userSchema, "users");
export default User;