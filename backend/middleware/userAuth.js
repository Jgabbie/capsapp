import jwt from "jsonwebtoken";
import User from "../models/users.js";

// Middleware to verify user authentication via JWT
const userAuth = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1]; // Extract token from "Bearer <token>"

        if (!token) {
            console.warn('[Auth] Rejected: no token in Authorization header');
            return res.status(401).json({ message: "Not Authorized. Login Again" });
        }

        // Verify the token
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET_ACCESS_KEY);
        
        // Check if user exists
        const user = await User.findById(tokenDecode.id);
        if (!user) {
            console.warn('[Auth] Rejected: user not found');
            return res.status(401).json({ message: "User not found" });
        }

        // Set userId for downstream middleware/controllers
        req.userId = tokenDecode.id;
        next();
    } catch (error) {
        console.error('[Auth] Token verification error:', error.message);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token expired. Login Again" });
        }

        return res.status(401).json({ message: "Not Authorized. Login Again" });
    }
};

export default userAuth;
