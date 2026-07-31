// READ
import RecentTour from "../models/recenttours.js";
const getRecentTours = async (req, res) => {
    try {

        const tours = await RecentTour.find()
            .sort({ createdAt: -1 });

        res.json(tours);

    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export {
    getRecentTours,
};