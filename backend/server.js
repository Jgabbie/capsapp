import express from "express";
import cors from "cors";
import connectDB from "./config/db.js"; // import db.js
import userRoutes from "./routes/userRoutes.js"; // import user routes

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api", userRoutes);

app.get("/", (req, res) => {
    res.send("API running");
});

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));