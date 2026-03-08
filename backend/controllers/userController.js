import User from "../models/users.js"; // ES module import
import bcrypt from "bcryptjs";

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

        // Basic validation
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Username, email, and password are required" });
        }

        // Check for existing username or email
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: "Username or email already exists" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const normalizedRole = normalizeRole(role);
        const roleValue = normalizedRole === "admin" ? "Admin" : "Users";

        // Create new user
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


export const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        const normalizedUsername = String(username || "").trim();
        const normalizedPassword = String(password || "");

        // Basic validation
        if (!normalizedUsername || !normalizedPassword) {
            return res.status(400).json({ success: false, message: "Username and password are required" });
        }

        // Find user by username or email (case-insensitive)
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

        // Compare passwords
        const isMatch = await bcrypt.compare(normalizedPassword, storedPasswordHash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid username or password" });
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

        if (!deletedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

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

        const updateData = {
            username,
            email,
            firstname,
            lastname,
            phonenum,
            phone: phone || phonenum,
        };

        const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).select("-password -hashedPassword");

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, user: updatedUser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};