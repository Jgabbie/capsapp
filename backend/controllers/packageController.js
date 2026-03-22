import PackageModel from "../models/package.js";

// Fetch all packages for the mobile Home screen
export const getPackages = async (req, res) => {
    try {
        const packages = await PackageModel.find();
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