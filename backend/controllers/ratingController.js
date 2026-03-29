import Rating from '../models/rating.js';
import mongoose from 'mongoose';

export const submitRating = async (req, res) => {
    const { packageId, rating, review } = req.body;
    const userId = req.userId || req.headers["x-user-id"]; // Fallback for mobile header

    try {
        if (!userId) {
            return res.status(401).json({ message: "Login required to submit a rating" });
        }

        if (!packageId || !rating) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const existingRating = await Rating.findOne({ packageId, userId });

        if (existingRating) {
            return res.status(400).json({
                message: "You have already submitted a review for this package"
            });
        }

        const newRating = await Rating.create({
            packageId,
            userId,
            rating,
            review
        });

        // Removed Socket.io emission since it's not strictly necessary for mobile basic saving
        
        return res.status(201).json({
            message: "Rating submitted successfully",
            rating: newRating
        });
    } catch (error) {
        res.status(500).json({
            message: "Error submitting rating",
            error: error.message
        });
    }
};

export const getPackageRatings = async (req, res) => {
    const { packageId } = req.params;

    try {
        const ratings = await Rating.find({ packageId })
            .populate('userId', 'username firstname lastname profileImage')
            .sort({ createdAt: -1 });
        res.status(200).json(ratings);
    } catch (error) {
        res.status(500).json({ message: "Error fetching ratings", error: error.message });
    }
};

export const getUserRatings = async (req, res) => {
    const userId = req.userId || req.headers["x-user-id"];

    try {
        const ratings = await Rating.find({ userId })
            .populate('packageId', 'packageName')
            .sort({ createdAt: -1 });
        res.status(200).json(ratings);
    } catch (error) {
        res.status(500).json({ message: "Error fetching ratings", error: error.message });
    }
};

export const deleteRating = async (req, res) => {
    const { id } = req.params;
    const userId = req.userId || req.headers["x-user-id"];

    try {
        const rating = await Rating.findById(id);
        if (!rating) {
            return res.status(404).json({ message: "Rating not found" });
        }
        if (!rating.userId || rating.userId.toString() !== userId) {
            return res.status(403).json({ message: "Forbidden" });
        }

        await rating.deleteOne();
        res.status(200).json({ message: "Rating deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting rating", error: error.message });
    }
};

export const updateRating = async (req, res) => {
    const { id } = req.params;
    const { rating, review } = req.body;
    const userId = req.userId || req.headers["x-user-id"];

    try {
        const existingRating = await Rating.findById(id);
        if (!existingRating) {
            return res.status(404).json({ message: "Rating not found" });
        }
        if (!existingRating.userId || existingRating.userId.toString() !== userId) {
            return res.status(403).json({ message: "Forbidden" });
        }
        
        existingRating.rating = rating;
        existingRating.review = review;
        await existingRating.save();
        
        res.status(200).json({ message: "Rating updated successfully", rating: existingRating });
    } catch (error) {
        res.status(500).json({ message: "Error updating rating", error: error.message });
    }
};

export const getAllRatings = async (_req, res) => {
    try {
        const ratings = await Rating.find({})
            .populate('userId', 'username firstname lastname')
            .populate('packageId', 'packageName')
            .sort({ createdAt: -1 });
        res.status(200).json(ratings);
    } catch (error) {
        res.status(500).json({ message: "Error fetching ratings", error: error.message });
    }
};

export const getAverageRating = async (req, res) => {
    try {
        const { packageId } = req.params;

        const result = await Rating.aggregate([
            {
                $match: {
                    packageId: new mongoose.Types.ObjectId(packageId)
                }
            },
            {
                $group: {
                    _id: "$packageId",
                    averageRating: { $avg: "$rating" },
                    totalRatings: { $sum: 1 }
                }
            }
        ]);

        if (result.length === 0) {
            return res.json({ averageRating: 0, totalRatings: 0 });
        }

        res.json(result[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

export const getAverageRatings = async (_req, res) => {
    try {
        const result = await Rating.aggregate([
            {
                $group: {
                    _id: "$packageId",
                    averageRating: { $avg: "$rating" },
                    totalRatings: { $sum: 1 }
                }
            }
        ]);

        const averages = result.map((item) => ({
            packageId: item._id,
            averageRating: item.averageRating,
            totalRatings: item.totalRatings
        }));

        return res.json({ averages });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};