import User from "../models/users.js";
import bcrypt from "bcryptjs";
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import logAction from "../utils/logger.js";
import { buildBrandedEmail } from "../utils/emailTemplate.js";

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const normalizeRole = (value) => String(value || "").trim().toLowerCase();
const canonicalRole = (value) => {
    const normalized = normalizeRole(value);
    if (normalized === "admin") return "Admin";
    if (normalized === "users" || normalized === "user" || normalized === "customer") return "Customer";
    return String(value || "").trim();
};

// --- HELPER FUNCTION: Modern HTML Email Template (OTP) ---
const generateOTPEmailTemplate = (otp, type) => {
    const messageText = type === 'reset'
        ? "Reset your password using the OTP below"
        : "Verify your account using the OTP below";

    return buildBrandedEmail({
        title: type === 'reset' ? 'Password Reset Code' : 'Account Verification Code',
        introHtml: messageText,
        bodyHtml: `
            <div style="display:flex; justify-content:center; margin:18px 0 22px;">
                <div style="background:#f8fafc; border:1px solid #dbe4f0; border-radius:16px; padding:22px 26px; min-width:260px; text-align:center; box-shadow:inset 0 1px 0 rgba(255,255,255,0.7);">
                    <div style="font-size:12px; letter-spacing:2px; color:#64748b; text-transform:uppercase; margin-bottom:10px; font-weight:700;">One-time code</div>
                    <div style="font-size:34px; font-weight:800; letter-spacing:10px; color:#b91c1c; font-family:Arial, sans-serif;">${otp}</div>
                </div>
            </div>
            <p style="color:#475569; font-size:14px; margin:0 0 14px; text-align:center;">This OTP expires in <strong>1 minute</strong>.</p>
            <p style="color:#64748b; font-size:12px; margin:0; text-align:center;">If you did not request this, you can safely ignore this email.</p>
        `,
        footerHtml: `
            <p style="font-size:10px; margin:0 0 8px; color:#94a3b8;">This is an automated security message. Please do not reply.</p>
            <p style="margin:3px 0; font-weight:700; color:#334155;">M&amp;RC Travel and Tours</p>
            <p style="margin:3px 0; color:#64748b;">info1@mrctravels.com</p>
            <p style="margin:3px 0; color:#64748b;">&copy; ${new Date().getFullYear()} M&amp;RC Travel and Tours. All rights reserved.</p>
        `,
    });
};

// --- HELPER FUNCTION: Welcome Email Template with Deep Link ---
const generateWelcomeEmailTemplate = (username) => {
    const deepLink = "travex://home";

    return buildBrandedEmail({
        title: 'Welcome to M&RC Travel and Tours',
        introHtml: `Hello <b>${username}</b>, your account has been successfully created.`,
        bodyHtml: `
            <p style="margin:0 0 14px;">Use the button below to open the app and continue with your account setup.</p>
            <p style="margin:0; color:#64748b;">If you did not create this account, please ignore this email.</p>
        `,
        ctaText: 'Open App',
        ctaUrl: deepLink,
        footerHtml: `
            <p style="font-size:10px; margin:0 0 8px; color:#94a3b8;">This is an automated message, please do not reply.</p>
            <p style="margin:3px 0; font-weight:700; color:#334155;">M&amp;RC Travel and Tours</p>
            <p style="margin:3px 0; color:#64748b;">info1@mrctravels.com</p>
            <p style="margin:3px 0; color:#64748b;">&copy; ${new Date().getFullYear()} M&amp;RC Travel and Tours. All rights reserved.</p>
        `,
    });
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
        const roleValue = normalizedRole === "admin" ? "Admin" : "Customer";

        const user = new User({
            username,
            firstname,
            lastname,
            email,
            phone: phone || phonenum || "",
            password: hashedPassword,
            hashedPassword,
            role: roleValue,
            isVerified: typeof isVerified === "boolean" ? isVerified : false,
            isAccountVerified: typeof isAccountVerified === "boolean" ? isAccountVerified : false
        });

        const savedUser = await user.save();

        try {
            const transporter = nodemailer.createTransport({
                host: 'smtp-relay.brevo.com',
                port: 587,
                secure: false,
                auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
            });

            const mailOptions = {
                from: process.env.SENDER_EMAIL,
                to: email,
                subject: 'Welcome to M&RC Travel and Tours',
                html: generateWelcomeEmailTemplate(username)
            };

            await transporter.sendMail(mailOptions);
            console.log("Welcome email sent to:", email);
        } catch (emailError) {
            console.error("Failed to send welcome email:", emailError);
        }

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
            logAction('LOGIN_FAILED', null, { "Failed Login": `Attempted username: ${normalizedUsername}` });
            return res.status(401).json({ success: false, message: "Invalid username or password" });
        }

        const storedPasswordHash = user.hashedPassword || user.password || user.hashed_password;
        if (!storedPasswordHash) {
            logAction('LOGIN_FAILED', null, { "Failed Login": `Attempted username: ${normalizedUsername}` });
            return res.status(401).json({ success: false, message: "Invalid username or password" });
        }

        const isMatch = await bcrypt.compare(normalizedPassword, storedPasswordHash);
        if (!isMatch) {
            logAction('LOGIN_FAILED', null, { "Failed Login": `Attempted username: ${normalizedUsername}` });
            return res.status(401).json({ success: false, message: "Invalid username or password" });
        }

        if (!user.isAccountVerified && !user.isVerified) {
            return res.status(403).json({ success: false, message: "Please verify your account", email: user.email });
        }

        logAction('CUSTOMER_LOGIN', user._id, { "Login": `User ${user.username} logged in successfully` });

        res.status(200).json({
            success: true,
            userId: user._id,
            username: user.username,
            role: canonicalRole(user.role),
            loginOnce: user.loginOnce
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password -hashedPassword -verifyOtp -resetOtp -refreshToken");
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password -hashedPassword -verifyOtp -resetOtp");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

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

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;

        const updateData = { ...req.body };
        delete updateData.password;
        delete updateData.hashedPassword;
        delete updateData.verifyOtp;
        delete updateData.resetOtp;

        if (req.body.phonenum) updateData.phone = req.body.phonenum;

        const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).select("-password -hashedPassword");

        if (!updatedUser) return res.status(404).json({ success: false, message: "User not found" });
        res.status(200).json({ success: true, user: updatedUser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const sendResetOtp = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 1 * 60 * 1000;
        await user.save();

        const transporter = nodemailer.createTransport({
            host: 'smtp-relay.brevo.com',
            port: 587,
            secure: false,
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'M&RC Travel and Tours - Password Reset OTP',
            html: generateOTPEmailTemplate(otp, 'reset')
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

export const sendVerifyOtp = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 1 * 60 * 1000;
        await user.save();

        const transporter = nodemailer.createTransport({
            host: 'smtp-relay.brevo.com',
            port: 587,
            secure: false,
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'M&RC Travel and Tours - Account Verification',
            html: generateOTPEmailTemplate(otp, 'verify')
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

        logAction('VERIFY_ACCOUNT', user._id, { "Account Verified": `Email: ${user.email}` });

        res.status(200).json({ success: true, message: "Account verified successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const redirectToApp = (req, res) => {
    res.send(`
        <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>Opening Travex...</title>
            </head>
            <body style="text-align: center; padding-top: 50px; font-family: sans-serif; color: #305797;">
                <h2>Opening Travex App...</h2>
                <p>Please wait while we redirect you to the Login screen.</p>
                <script>
                    window.location.href = "travex://login";
                    setTimeout(() => {
                        window.location.href = "http://localhost:3000/login"; 
                    }, 2500);
                </script>
            </body>
        </html>
    `);
};

export const updateLoginOnce = async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        user.loginOnce = true;
        await user.save();

        res.status(200).json({ success: true, message: "Updated loginOnce status" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};