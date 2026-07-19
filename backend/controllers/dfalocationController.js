import DfaLocation from "../models/dfalocations.js";

// GET ALL
const getLocations = async (req, res) => {
    try {

        const locations = await DfaLocation.find().sort({
            location: 1
        });

        return res.status(200).json(locations);

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            message: "Unable to fetch DFA locations."
        });
    }
};

// CREATE
const createLocation = async (req, res) => {

    try {

        const { location } = req.body;

        if (!location?.trim()) {
            return res.status(400).json({
                message: "Location is required."
            });
        }

        const exists = await DfaLocation.findOne({
            location: {
                $regex: `^${location.trim()}$`,
                $options: "i"
            }
        });

        if (exists) {
            return res.status(400).json({
                message: "Location already exists."
            });
        }

        const newLocation = await DfaLocation.create({
            location: location.trim()
        });

        return res.status(201).json(newLocation);

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            message: "Unable to create location."
        });

    }
};

// UPDATE
const updateLocation = async (req, res) => {

    try {

        const { id } = req.params;
        const { location } = req.body;

        if (!location?.trim()) {
            return res.status(400).json({
                message: "Location is required."
            });
        }

        const duplicate = await DfaLocation.findOne({
            _id: { $ne: id },
            location: {
                $regex: `^${location.trim()}$`,
                $options: "i"
            }
        });

        if (duplicate) {
            return res.status(400).json({
                message: "Location already exists."
            });
        }

        const updated = await DfaLocation.findByIdAndUpdate(
            id,
            {
                location: location.trim()
            },
            {
                new: true
            }
        );

        if (!updated) {
            return res.status(404).json({
                message: "Location not found."
            });
        }

        return res.status(200).json(updated);

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            message: "Unable to update location."
        });

    }
};

// DELETE
const deleteLocation = async (req, res) => {

    try {

        const deleted = await DfaLocation.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({
                message: "Location not found."
            });
        }

        return res.status(200).json({
            message: "Location deleted successfully."
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            message: "Unable to delete location."
        });

    }
};


export {
    getLocations,
    createLocation,
    updateLocation,
    deleteLocation
};