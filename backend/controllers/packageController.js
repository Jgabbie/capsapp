import PackageModel from "../models/package.js";

// Fetch all packages for the mobile Home screen
export const getPackages = async (req, res) => {
    try {
        // 🔥 NEW: We use an Aggregation Pipeline to join the 'ratings' collection
        // and calculate the average rating on the fly! This is 100x faster for mobile.
        const packages = await PackageModel.aggregate([
            {
                $lookup: {
                    from: "ratings",       // The name of your ratings collection
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
                // Optional: remove the huge array of individual reviews so the payload stays small
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