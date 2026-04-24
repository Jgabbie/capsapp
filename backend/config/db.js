import mongoose from "mongoose";

const connectDB = async () => {
    try {
        // 🔥 FIX: We are no longer hardcoding this! It will now read the exact 
        // string from your .env file (which we already made identical to the web app)
        const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
        
        await mongoose.connect(uri);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
        process.exit(1); 
    }
};

export default connectDB;