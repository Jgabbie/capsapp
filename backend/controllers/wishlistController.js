import Wishlist from '../models/wishlist.js';
import PackageModel from '../models/package.js';


//add to wishlist function
const addToWishlist = async (req, res) => {
    const { packageId } = req.body;
    const userId = req.userId;
    try {
        if (!packageId) return res.status(400).json({ message: "Package ID is required" });
        if (!userId) return res.status(400).json({ message: "User ID is required" });

        const existingEntry = await Wishlist.findOne({ userId, packageId });
        if (existingEntry) {
            return res.status(400).json({ message: "Package already in wishlist" });
        }

        const newEntry = new Wishlist({ userId, packageId });
        await newEntry.save();
        return res.status(201).json({ message: "Package added to wishlist" });
    } catch (error) {
        console.error("Error adding to wishlist:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


//get wishlist function
const getWishlist = async (req, res) => {
    const userId = req.userId;

    try {
        if (!userId) {
            return res.status(400).json({
                message: "User ID is required"
            });
        }

        const wishlist = await Wishlist.find({ userId })
            .populate('packageId')
            .sort({ createdAt: -1 });

        const packageIds = wishlist
            .map((wishlistItem) => wishlistItem.packageId?._id)
            .filter(Boolean);

        const packagesWithRatings = await PackageModel.aggregate([
            {
                $match: {
                    _id: {
                        $in: packageIds
                    }
                }
            },
            {
                $lookup: {
                    from: "ratings",
                    localField: "_id",
                    foreignField: "packageId",
                    as: "reviews"
                }
            },
            {
                $addFields: {
                    averageRating: {
                        $cond: [
                            {
                                $gt: [
                                    {
                                        $size: "$reviews"
                                    },
                                    0
                                ]
                            },
                            {
                                $avg: "$reviews.rating"
                            },
                            0
                        ]
                    }
                }
            },
            {
                $project: {
                    reviews: 0
                }
            }
        ]);

        const packageRatingMap = new Map(
            packagesWithRatings.map((pkg) => [
                String(pkg._id),
                pkg
            ])
        );

        const enrichedWishlist = wishlist.map((wishlistItem) => {
            const wishlistObject = wishlistItem.toObject();
            const packageId = wishlistItem.packageId?._id;

            if (!packageId) {
                return wishlistObject;
            }

            const packageWithRating =
                packageRatingMap.get(String(packageId));

            return {
                ...wishlistObject,
                packageId:
                    packageWithRating ||
                    wishlistObject.packageId
            };
        });

        return res.status(200).json({
            wishlist: enrichedWishlist
        });
    } catch (error) {
        console.error("Error fetching wishlist:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};


//remove from wishlist function
const removeFromWishlist = async (req, res) => {
    const { packageId } = req.body;
    const userId = req.userId;
    try {
        if (!packageId) return res.status(400).json({ message: "Package ID is required" });
        if (!userId) return res.status(400).json({ message: "User ID is required" });

        const existingEntry = await Wishlist.findOne({ userId, packageId });
        if (!existingEntry) {
            return res.status(404).json({ message: "Package not found in wishlist" });
        }

        await Wishlist.deleteOne({ userId, packageId });
        return res.status(200).json({ message: "Package removed from wishlist" });
    } catch (error) {
        console.error("Error removing from wishlist:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export {
    addToWishlist,
    getWishlist,
    removeFromWishlist
}