import User from "../models/users.js";
import bcrypt from "bcryptjs";
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import logAction from "../utils/logger.js";
import { buildBrandedEmail } from "../utils/emailTemplate.js";

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const getBackendBaseUrl = () => String(process.env.BACKEND_URL || process.env.API_URL || "http://localhost:5000").replace(/\/$/, "");
const getFrontendLoginUrl = () => {
    const fallback = process.env.FRONTEND_LOGIN_URL || process.env.FRONTEND_URL || process.env.WEB_URL || process.env.CLIENT_URL || "";
    return String(fallback).replace(/\/$/, "");
};
const normalizeRole = (value) => String(value || "").trim().toLowerCase();
const canonicalRole = (value) => {
    const normalized = normalizeRole(value);
    if (normalized === "admin") return "Admin";
    if (normalized === "users" || normalized === "user" || normalized === "customer") return "Customer";
    return String(value || "").trim();
};

const generateVerificationEmailTemplate = (username, appDeepLink, webVerifyLink) => {
    return `
        <div style="font-family: Arial, sans-serif; background:#305797; padding:30px 16px;">
            <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:0; padding:30px 32px; text-align:left;">

                <img src="https://mrctravelandtours.com/images/Logo.png" style="width:100px; margin-bottom:15px;" />

                <h2 style="color:#305797; margin-bottom:10px;">
                    Welcome to M&amp;RC Travel and Tours
                </h2>

                <p style="color:#555; font-size:16px;">
                    Hello <b>${username}</b>,
                </p>

                <p style="color:#555; font-size:15px; line-height:1.6;">
                    Your account has been successfully created!
                </p>

                <p style="color:#555; font-size:15px; line-height:1.6;">
                    Kindly click the button below to verify your email address and activate your account.
                </p>

                <a href="${appDeepLink}"
                    style="
                        display:inline-block;
                        margin-top:25px;
                        padding:12px 28px;
                        background:#305797;
                        color:#ffffff;
                        text-decoration:none;
                        border-radius:6px;
                        font-weight:bold;
                        font-size:14px;
                    ">
                    Verify Account
                </a>

                <p style="color:#777; font-size:13px; margin-top:30px;">
                    If you did not create this account, please ignore this email.
                </p>

                <hr style="margin:30px 0; border:none; border-top:1px solid #eee;" />

                <div style="max-width:520px; margin:auto; padding:15px; text-align:center; color:#555; font-size:12px;">
                    <p style="font-size:10px; margin-bottom:5px;">This is an automated message, please do not reply.</p>
                    <p>M&amp;RC Travel and Tours</p>
                    <p>info1@mrctravels.com</p>
                    <p>&copy; ${new Date().getFullYear()} M&amp;RC Travel and Tours. All rights reserved.</p>
                </div>
            </div>
        </div>
    `;
};

// --- HELPER FUNCTION: Modern HTML Email Template (OTP) ---
const generateOTPEmailTemplate = (otp, type) => {
    const messageText = type === 'reset'
        ? "Reset your password using the OTP below"
        : type === 'login'
            ? "Use the OTP below to complete your login"
            : "Verify your account using the OTP below";

    return buildBrandedEmail({
        title: type === 'reset' ? 'Password Reset Code' : type === 'login' ? 'Login Verification Code' : 'Account Verification Code',
        introHtml: messageText,
        bodyHtml: `
            <div style="margin:18px 0 22px; text-align:center;">
                <div style="display:inline-block; background:#f8fafc; border:1px solid #dbe4f0; border-radius:16px; padding:22px 26px; min-width:260px; text-align:center; box-shadow:inset 0 1px 0 rgba(255,255,255,0.7);">
                    <div style="font-size:32px; font-weight:700; letter-spacing:10px; color:#992A46; font-family:Arial, sans-serif;">${otp}</div>
                </div>
            </div>
            <p style="color:#475569; font-size:14px; margin:0 0 14px; text-align:left;">This OTP expires in <strong>1 minute</strong>.</p>
            <p style="color:#64748b; font-size:12px; margin:0; text-align:left;">If you did not request this, you can safely ignore this email.</p>
        `,
        footerHtml: `
            <p style="font-size:10px; margin:0 0 8px; color:#94a3b8;">This is an automated security message. Please do not reply.</p>
            <p style="margin:3px 0; font-weight:700; color:#334155;">M&amp;RC Travel and Tours</p>
            <p style="margin:3px 0; color:#64748b;">info1@mrctravels.com</p>
            <p style="margin:3px 0; color:#64748b;">&copy; ${new Date().getFullYear()} M&amp;RC Travel and Tours. All rights reserved.</p>
        `,
    });
};

const createVerificationLink = async (user) => {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = await bcrypt.hash(rawToken, 10);

    user.emailVerifyToken = hashedToken;
    user.emailVerifyTokenExpireAt = Date.now() + 10 * 60 * 1000;
    user.isVerified = false;
    user.isAccountVerified = false;
    await user.save();

    const webVerifyLink = `${getBackendBaseUrl()}/api/users/auth/verify-email?token=${rawToken}&email=${encodeURIComponent(user.email)}`;
    const appDeepLink = `travex://verify?token=${rawToken}&email=${encodeURIComponent(user.email)}`;
    const transporter = nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false,
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    const mailOptions = {
        from: `M&RC Travel and Tours <${process.env.SENDER_EMAIL}>`,
        to: user.email,
        subject: 'Welcome to M&RC Travel and Tours',
        html: generateVerificationEmailTemplate(user.username, appDeepLink, webVerifyLink)
    };

    await transporter.sendMail(mailOptions);
    return { appDeepLink, webVerifyLink };
};

const buildLoginRedirectHtml = (title, message, fallbackUrl = getFrontendLoginUrl()) => `
    <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>${title}</title>
        </head>
        <body style="text-align:center; padding-top:50px; font-family:sans-serif; color:#305797;">
            <h2>${title}</h2>
            <p>${message}</p>
            <script>
                window.location.href = "travex://login";
                ${fallbackUrl ? `setTimeout(() => {\n                    window.location.href = ${JSON.stringify(fallbackUrl)};\n                }, 2500);` : ""}
            </script>
        </body>
    </html>
`;

const sendLoginOtpEmail = async (user, rawOtp) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false,
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    const mailOptions = {
        from: `M&RC Travel and Tours <${process.env.SENDER_EMAIL}>`,
        to: user.email,
        subject: 'M&RC Travel and Tours - Login OTP',
        html: generateOTPEmailTemplate(rawOtp, 'login')
    };

    await transporter.sendMail(mailOptions);
};

// CREATE USER
export const createUser = async (req, res) => {
    try {
        const { username, email, password, firstname, lastname, phonenum, phone, role, isVerified, isAccountVerified } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "Username, email, and password are required" });
        }

        const existingUser = await User.findOne({ $or: [{ username }, { email }, { phonenum }, { phone: phonenum }] });
        if (existingUser) {
            if (existingUser.username === username) {
                return res.status(400).json({ message: "Username already exists" });
            } else if (existingUser.email === email) {
                return res.status(400).json({ message: "Email already exists" });
            } else if (existingUser.phonenum === phonenum || existingUser.phone === phonenum) {
                return res.status(400).json({ message: "Phone number already registered" });
            }
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
            await createVerificationLink(savedUser);
        } catch (emailError) {
            console.error("Failed to send welcome email:", emailError);
        }

        res.status(201).json({ success: true, userId: savedUser._id, verificationEmailSent: true });
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
            await createVerificationLink(user);
            return res.status(403).json({ success: false, message: "Please verify your account", email: user.email });
        }

        const rawOtp = String(Math.floor(100000 + Math.random() * 900000));
        const hashedOtp = await bcrypt.hash(rawOtp, 10);

        user.loginOtp = hashedOtp;
        user.loginOtpExpireAt = Date.now() + 1 * 60 * 1000;
        user.loginOtpAttempts = 0;
        user.loginOtpBlockedUntil = 0;
        await user.save();

        await sendLoginOtpEmail(user, rawOtp);

        logAction('LOGIN_OTP_SENT', user._id, { "Login OTP": `OTP sent to ${user.email}` });

        return res.status(200).json({
            success: true,
            otpRequired: true,
            message: "OTP sent to your email address",
            email: user.email,
            userId: user._id,
            username: user.username,
            role: canonicalRole(user.role),
            loginOnce: user.loginOnce
        });

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
        const users = await User.find().select("-password -hashedPassword -verifyOtp -resetOtp -refreshToken -emailVerifyToken -loginOtp -loginOtpAttempts -loginOtpBlockedUntil");
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password -hashedPassword -verifyOtp -resetOtp -emailVerifyToken -loginOtp -loginOtpAttempts -loginOtpBlockedUntil");
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
        delete updateData.emailVerifyToken;
        delete updateData.loginOtp;
        delete updateData.loginOtpAttempts;
        delete updateData.loginOtpBlockedUntil;

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
            from: `M&RC Travel and Tours <${process.env.SENDER_EMAIL}>`,
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

export const verifyEmailLink = async (req, res) => {
    const { email, token } = req.query;

    try {
        if (!email || !token) {
            return res.status(400).send(buildLoginRedirectHtml("Verification Failed", "The verification link is incomplete."));
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send(buildLoginRedirectHtml("Verification Failed", "We could not find this account."));
        }

        if (!user.emailVerifyToken || !user.emailVerifyTokenExpireAt || user.emailVerifyTokenExpireAt < Date.now()) {
            return res.status(400).send(buildLoginRedirectHtml("Verification Failed", "This verification link has expired. Please request a new one."));
        }

        const tokenMatches = await bcrypt.compare(String(token), String(user.emailVerifyToken));
        if (!tokenMatches) {
            return res.status(400).send(buildLoginRedirectHtml("Verification Failed", "This verification link is invalid."));
        }

        user.isVerified = true;
        user.isAccountVerified = true;
        user.emailVerifyToken = "";
        user.emailVerifyTokenExpireAt = 0;
        await user.save();

        logAction('VERIFY_ACCOUNT', user._id, { "Account Verified": `Email: ${user.email}` });

        return res.status(200).send(buildLoginRedirectHtml("Account Verified", "Your account has been verified. Redirecting you to the login screen."));
    } catch (error) {
        return res.status(500).send(buildLoginRedirectHtml("Verification Failed", error.message));
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
            from: `M&RC Travel and Tours <${process.env.SENDER_EMAIL}>`,
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

export const sendLoginOtp = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        if (!user.isAccountVerified && !user.isVerified) {
            return res.status(403).json({ success: false, message: "Please verify your account", email: user.email });
        }

        const rawOtp = String(Math.floor(100000 + Math.random() * 900000));
        const hashedOtp = await bcrypt.hash(rawOtp, 10);

        user.loginOtp = hashedOtp;
        user.loginOtpExpireAt = Date.now() + 1 * 60 * 1000;
        user.loginOtpAttempts = 0;
        user.loginOtpBlockedUntil = 0;
        await user.save();

        await sendLoginOtpEmail(user, rawOtp);

        res.status(200).json({ success: true, message: "OTP sent to your email address", email: user.email });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to send email." });
    }
};

export const verifyLoginOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        if (user.loginOtpBlockedUntil && user.loginOtpBlockedUntil > Date.now()) {
            return res.status(429).json({ success: false, message: "Too many attempts. Try again in 5 minutes." });
        }

        if (!user.loginOtp || !user.loginOtpExpireAt || user.loginOtpExpireAt < Date.now()) {
            return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
        }

        const otpMatches = await bcrypt.compare(String(otp), String(user.loginOtp));
        if (!otpMatches) {
            user.loginOtpAttempts = (user.loginOtpAttempts || 0) + 1;

            if (user.loginOtpAttempts >= 5) {
                user.loginOtpBlockedUntil = Date.now() + 5 * 60 * 1000;
                user.loginOtpAttempts = 0;
            }

            await user.save();
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        user.loginOtp = "";
        user.loginOtpExpireAt = 0;
        user.loginOtpAttempts = 0;
        user.loginOtpBlockedUntil = 0;
        await user.save();

        logAction('CUSTOMER_LOGIN', user._id, { "Login": `User ${user.username} logged in successfully` });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            userId: user._id,
            username: user.username,
            role: canonicalRole(user.role),
            loginOnce: user.loginOnce
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
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
    res.send(buildLoginRedirectHtml("Opening Travex...", "Please wait while we redirect you to the Login screen."));
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

// CHECK IF PHONE NUMBER EXISTS
export const checkPhoneNumberExists = async (req, res) => {
    try {
        const { phonenum } = req.params;

        if (!phonenum) {
            return res.status(400).json({ success: false, message: "Phone number is required" });
        }

        const existingUser = await User.findOne({
            $or: [{ phonenum }, { phone: phonenum }]
        });

        if (existingUser) {
            return res.status(200).json({ success: true, exists: true, message: "Phone number already registered" });
        }

        res.status(200).json({ success: true, exists: false, message: "Phone number is available" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};