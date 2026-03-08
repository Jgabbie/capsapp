import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import connectDB from "./config/db.js"; // import db.js
import userRoutes from "./routes/userRoutes.js"; // import user routes
import bookingRoutes from "./routes/bookingRoutes.js";
import quotationRoutes from "./routes/quotationRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connect to MongoDB
connectDB();

// Routes
app.use("/api", userRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/quotation", quotationRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/transaction", transactionRoutes);

app.get("/", (req, res) => {
    res.send("API running");
});

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));