import User from "../models/users.js"; 
import bcrypt from "bcryptjs";
import nodemailer from 'nodemailer'; 
import crypto from 'crypto';         

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const normalizeRole = (value) => String(value || "").trim().toLowerCase();
const canonicalRole = (value) => {
    const normalized = normalizeRole(value);
    if (normalized === "admin") return "Admin";
    if (normalized === "users" || normalized === "user") return "Users";
    return String(value || "").trim();
};

// CREATE USER
export const createUser = async (req, res) => {
    try {
        const { username, email, password, firstname, lastname, phonenum, phone, role, isVerified, isAccountVerified } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "Username, email, and password are required" });
        }

        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: "Username or email already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const normalizedRole = normalizeRole(role);
        const roleValue = normalizedRole === "admin" ? "Admin" : "Users";

        const user = new User({
            username,
            firstname,
            lastname,
            email,
            phone: phone || phonenum || "",
            phonenum: phonenum || phone || "",
            password: hashedPassword,
            hashedPassword,
            role: roleValue,
            isVerified: typeof isVerified === "boolean" ? isVerified : false,
            isAccountVerified: typeof isAccountVerified === "boolean" ? isAccountVerified : false
        });

        const savedUser = await user.save();
        res.status(201).json({ success: true, userId: savedUser._id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// LOGIN USER
export const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        const normalizedUsername = String(username || "").trim();
        const normalizedPassword = String(password || "");

        if (!normalizedUsername || !normalizedPassword) {
            return res.status(400).json({ success: false, message: "Username and password are required" });
        }

        const user = await User.findOne({
            $or: [
                { username: { $regex: `^${escapeRegex(normalizedUsername)}$`, $options: "i" } },
                { email: { $regex: `^${escapeRegex(normalizedUsername)}$`, $options: "i" } },
            ],
        });
        
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid username or password" });
        }

        const storedPasswordHash = user.hashedPassword || user.password || user.hashed_password;
        if (!storedPasswordHash) {
            return res.status(401).json({ success: false, message: "Invalid username or password" });
        }

        const isMatch = await bcrypt.compare(normalizedPassword, storedPasswordHash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid username or password" });
        }

        // ---> THIS IS THE MAGIC CHECK FOR UNVERIFIED USERS <---
        if (!user.isAccountVerified && !user.isVerified) {
            return res.status(403).json({ success: false, message: "Please verify your account", email: user.email });
        }

        // Login successful
        res.status(200).json({ success: true, userId: user._id, username: user.username, role: canonicalRole(user.role) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET ALL USERS
export const getUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password -hashedPassword -verifyOtp -resetOtp -refreshToken");
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE USER
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) return res.status(404).json({ success: false, message: "User not found" });
        res.status(200).json({ success: true, message: "User deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// UPDATE USER
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, firstname, lastname, phonenum, phone } = req.body;
        const updateData = { username, email, firstname, lastname, phonenum, phone: phone || phonenum };
        const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).select("-password -hashedPassword");
        if (!updatedUser) return res.status(404).json({ success: false, message: "User not found" });
        res.status(200).json({ success: true, user: updatedUser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// =========================================================
// PASSWORD RESET LOGIC 
// =========================================================
export const sendResetOtp = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 10 * 60 * 1000;
        await user.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'M&RC Travel and Tours - Password Reset OTP',
            html: `
                <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                    <h2>M&RC Travel and Tours</h2>
                    <p>You requested a password reset. Here is your OTP:</p>
                    <h1 style="color: #305797; letter-spacing: 5px;">${otp}</h1>
                    <p>This code will expire in 10 minutes.</p>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: "OTP sent successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to send email." });
    }
};

export const checkResetOtp = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        if (user.resetOtp !== otp) return res.status(400).json({ success: false, message: "Invalid OTP" });
        if (user.resetOtpExpireAt < Date.now()) return res.status(400).json({ success: false, message: "OTP has expired" });

        const resetToken = crypto.randomBytes(32).toString("hex");
        user.resetOtp = resetToken; 
        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000; 
        await user.save();

        res.status(200).json({ success: true, resetToken });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        const user = await User.findOne({ resetOtp: token, resetOtpExpireAt: { $gt: Date.now() } });
        if (!user) return res.status(400).json({ success: false, message: "Invalid or expired session. Please request a new OTP." });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        user.hashedPassword = hashedPassword; 
        user.resetOtp = "";
        user.resetOtpExpireAt = 0;
        await user.save();

        res.status(200).json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// =========================================================
// NEW: ACCOUNT VERIFICATION OTP LOGIC
// =========================================================
export const sendVerifyOtp = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 10 * 60 * 1000; 
        await user.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'M&RC Travel and Tours - Account Verification',
            html: `
                <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                    <h2>Welcome to M&RC Travel and Tours!</h2>
                    <p>Please use the following code to verify your account:</p>
                    <h1 style="color: #305797; letter-spacing: 5px;">${otp}</h1>
                    <p>This code will expire in 10 minutes.</p>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: "Verification OTP sent" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to send email." });
    }
};

export const verifyAccount = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        if (user.verifyOtp !== otp) return res.status(400).json({ success: false, message: "Invalid OTP" });
        if (user.verifyOtpExpireAt < Date.now()) return res.status(400).json({ success: false, message: "OTP has expired" });

        user.isVerified = true;
        user.isAccountVerified = true;
        user.verifyOtp = ""; 
        user.verifyOtpExpireAt = 0;
        await user.save();

        res.status(200).json({ success: true, message: "Account verified successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};