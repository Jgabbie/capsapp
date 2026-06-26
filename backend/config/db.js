import mongoose from "mongoose";

import {
    startNotificationPushWorker,
} from "./workers/notificationPushWorker.js";

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        const dbName = process.env.MONGO_DB_NAME;

        await mongoose.connect(uri, {
            dbName: dbName,
        });
        console.log("MongoDB connected successfully");

        startNotificationPushWorker();

    } catch (error) {
        console.error("MongoDB connection error:", error.message);
        process.exit(1);
    }
};

export default connectDB;