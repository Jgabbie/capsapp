import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import connectDB from "./config/db.js"; 

// --- Route Imports ---
import userRoutes from "./routes/userRoutes.js"; 
import bookingRoutes from "./routes/bookingRoutes.js";
import quotationRoutes from "./routes/quotationRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import packageRoutes from "./routes/packageRoutes.js"; 
import wishlistRoutes from "./routes/wishlistRoutes.js"; 
import passportRoutes from "./routes/passportRoutes.js";
import visaRoutes from "./routes/visaRoutes.js";
import visaServiceRoutes from "./routes/visaServiceRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Static Assets
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- API Routes ---
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/quotation", quotationRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/transaction", transactionRoutes);
app.use("/api/package", packageRoutes); 
app.use("/api/wishlist", wishlistRoutes); 
app.use("/api/passport", passportRoutes);
app.use("/api/visa", visaRoutes);
app.use("/api/visa-services", visaServiceRoutes);

app.get("/", (req, res) => {
    res.send("TRAVEX API Running");
});

// Start server
// Using process.env.PORT allows flexibility for deployment
const PORT = process.env.PORT || 5000;

// ADDED '0.0.0.0' HERE: This tells the server to accept connections from the Android emulator.
app.listen(PORT, '0.0.0.0', () => console.log(`Server exfiltrated and running on port ${PORT}`));