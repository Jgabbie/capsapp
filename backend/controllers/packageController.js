import PackageModel from "../models/package.js";

// Fetch all packages for the mobile Home screen
export const getPackages = async (req, res) => {
    try {
        const packages = await PackageModel.aggregate([
            {
                $lookup: {
                    from: "ratings",
                    localField: "_id",     // The package ID in the packages collection
                    foreignField: "packageId", // The package ID stored in the rating document
                    as: "reviews"
                }
            },
            {
                $addFields: {
                    averageRating: {
                        $cond: {
                            if: { $gt: [{ $size: "$reviews" }, 0] },
                            then: { $avg: "$reviews.rating" },
                            else: 0 // If no reviews, default to 0
                        }
                    }
                }
            },
            {
                $project: {
                    reviews: 0
                }
            }
        ]);

        res.status(200).json(packages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// Fetch a single package by ID (for package details screen)
export const getPackage = async (req, res) => {
    try {
        const { id } = req.params;

        const pkg = await PackageModel.findById(id);

        if (!pkg) return res.status(404).json({ message: "Package not found" });

        res.status(200).json(pkg);
    } catch (err) {
        console.error("getPackage error:", err);
        res.status(500).json({ error: err.message });
    }
};

// Admin: Update Itinerary Images for a Package
export const updateItineraryImages = async (req, res) => {
    try {
        const { packageId } = req.params;
        const { packageItineraryImages } = req.body;

        if (!packageId || !packageItineraryImages || typeof packageItineraryImages !== 'object') {
            return res.status(400).json({ message: 'Package ID and itinerary images object are required' });
        }

        const updatedPackage = await PackageModel.findByIdAndUpdate(
            packageId,
            { packageItineraryImages },
            { new: true }
        );

        if (!updatedPackage) {
            return res.status(404).json({ message: 'Package not found' });
        }

        res.status(200).json({ 
            message: 'Itinerary images updated successfully',
            package: updatedPackage 
        });
    } catch (err) {
        console.error("updateItineraryImages error:", err);
        res.status(500).json({ error: err.message });
    }
};

// Admin: Add sample itinerary images to first Japan package (for testing)
export const addSampleItineraryImages = async (req, res) => {
    try {
        // Find first package (or specify by name)
        const pkg = await PackageModel.findOne().limit(1);

        if (!pkg) {
            return res.status(404).json({ message: 'No packages found in database' });
        }

        // Sample images from a public source (Japan travel images)
        // Key format must match: day1, day2, day3, etc. (lowercase, no space)
        const sampleImages = {
            'day1': 'https://images.unsplash.com/photo-1552883322-ee51895a5fe1?w=500&h=300&fit=crop',
            'day2': 'https://images.unsplash.com/photo-1562183241-b8121a6c6db6?w=500&h=300&fit=crop',
            'day3': 'https://images.unsplash.com/photo-1524341990857-a0ad193e532d?w=500&h=300&fit=crop',
            'day4': 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=500&h=300&fit=crop',
            'day5': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop',
        };

        const updatedPackage = await PackageModel.findByIdAndUpdate(
            pkg._id,
            { packageItineraryImages: sampleImages },
            { new: true }
        );

        res.status(200).json({ 
            message: 'Sample itinerary images added successfully',
            packageName: updatedPackage.packageName,
            packageId: updatedPackage._id,
            images: sampleImages
        });
    } catch (err) {
        console.error("addSampleItineraryImages error:", err);
        res.status(500).json({ error: err.message });
    }
};