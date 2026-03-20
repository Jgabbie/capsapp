import mongoose from "mongoose";

// MongoDB connection string
const MONGO_URI = "mongodb+srv://jgablanuza_db_user:mtTMAbnveggSPF20@travelsystem.vpnslab.mongodb.net/?appName=TravelSystem";
// For Atlas, you can use:
// const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
    try {
        // Connect without deprecated options
        await mongoose.connect(MONGO_URI);
        console.log("MongoDB connected");
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
        process.exit(1); // Stop server if DB fails
    }
};

export default connectDB;