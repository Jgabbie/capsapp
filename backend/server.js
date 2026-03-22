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
import packageRoutes from "./routes/packageRoutes.js"; // <--- NEW IMPORT
import passportRoutes from "./routes/passportRoutes.js";
import visaRoutes from "./routes/visaRoutes.js";
import visaServiceRoutes from "./routes/visaServiceRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connect to MongoDB
connectDB();

// Routes
app.use("/api", userRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/quotation", quotationRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/transaction", transactionRoutes);
app.use("/api", packageRoutes); // <--- NEW ROUTE
app.use("/api/passport", passportRoutes);
app.use("/api/visa", visaRoutes);
app.use("/api/visa-services", visaServiceRoutes);

app.get("/", (req, res) => {
    res.send("API running");
});

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));