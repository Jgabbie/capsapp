import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import connectDB from "./config/db.js"; 

import userRoutes from "./routes/userRoutes.js"; 
import bookingRoutes from "./routes/bookingRoutes.js";
import quotationRoutes from "./routes/quotationRoutes.js";
import payRoutes from "./routes/payRoutes.js"; 
import transactionRoutes from "./routes/transactionRoutes.js";
import packageRoutes from "./routes/packageRoutes.js"; 
import wishlistRoutes from "./routes/wishlistRoutes.js"; 
import passportRoutes from "./routes/passportRoutes.js";
import visaRoutes from "./routes/visaRoutes.js";
import visaServiceRoutes from "./routes/visaServiceRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import sendEmailRoutes from "./routes/sendEmailRoutes.js";
import ratingRoutes from "./routes/ratingRoutes.js";
import uploadRoutes from './routes/uploadRoutes.js';

// 🔥 NEW: Import the log routes we just created 🔥
import logRoutes from "./routes/logRoutes.js";

// 🔥 NEW: Import the preferences routes 🔥
import preferenceRoutes from "./routes/preferencesRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

connectDB();

// IMPORTANT: Apply CORS and parsers BEFORE your routes!
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/quotation", quotationRoutes);
app.use("/api/payment", payRoutes);
app.use("/api/transaction", transactionRoutes);
app.use("/api/package", packageRoutes); 
app.use("/api/wishlist", wishlistRoutes); 
app.use("/api/passport", passportRoutes);
app.use("/api/visa", visaRoutes);
app.use("/api/visa-services", visaServiceRoutes);
app.use("/api/email", sendEmailRoutes);
app.use("/api/rating", ratingRoutes);
app.use("/api/upload", uploadRoutes);

// 🔥 NEW: Mount the log routes so the frontend can access them! 🔥
app.use("/api/logs", logRoutes);

// 🔥 NEW: Mount the preferences routes! 🔥
app.use("/api/preferences", preferenceRoutes);

app.get("/", (req, res) => {
    res.send("TRAVEX API Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));