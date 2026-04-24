import User from "../models/users.js"; 
import bcrypt from "bcryptjs";
import nodemailer from 'nodemailer'; 
import crypto from 'crypto';         
import logAction from "../utils/logger.js"; 

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

    return `
    <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 40px 20px; text-align: center;">
        <div style="background-color: #ffffff; max-width: 500px; margin: 0 auto; padding: 40px 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <h2 style="color: #305797; margin-top: 0; margin-bottom: 20px; font-size: 24px;">M&RC Travel and Tours</h2>
            
            <p style="color: #4b5563; font-size: 16px; margin-bottom: 30px;">
                ${messageText}
            </p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 30px; display: inline-block; min-width: 250px;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 12px; color: #b91c1c; margin-left: 12px;">${otp}</span>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 30px;">
                This OTP will expire in <strong>1 minute</strong>.
            </p>
            
            <p style="color: #9ca3af; font-size: 12px; margin-top: 20px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                If you did not request this, please ignore this email.
            </p>
        </div>
    </div>
    `;
};

// --- HELPER FUNCTION: Welcome Email Template with Deep Link ---
const generateWelcomeEmailTemplate = (username) => {
    const redirectUrl = "http://192.168.1.7:5000/api/users/redirect-to-app";

    return `
    <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 40px 20px; text-align: center;">
        <div style="background-color: #ffffff; max-width: 500px; margin: 0 auto; padding: 40px 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <h2 style="color: #305797; margin-top: 0; margin-bottom: 20px; font-size: 24px;">Welcome to M&RC Travel and Tours</h2>
            
            <p style="color: #4b5563; font-size: 16px; margin-bottom: 20px;">
                Hello <strong>${username}</strong>,
            </p>

            <p style="color: #4b5563; font-size: 14px; margin-bottom: 30px;">
                Your account has been successfully created!<br><br>
                Kindly log in to verify your account and start browsing our travel packages, tours, and exclusive offers.
            </p>
            
            <a href="${redirectUrl}" style="background-color: #305797; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin-bottom: 30px;">
                Log In to Your Account
            </a>
            
            <p style="color: #9ca3af; font-size: 12px; margin-top: 20px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                If you did not create this account, please ignore this email.
            </p>
        </div>
    </div>
    `;
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
            phonenum: phonenum || phone || "",
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