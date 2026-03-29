import PackageModel from "../models/package.js";

// Fetch all packages for the mobile Home screen
export const getPackages = async (req, res) => {
    try {
        // 🔥 THE FIX: Use .select() to exclude the heavy Base64 image fields.
        // The minus sign (-) tells MongoDB "Send everything EXCEPT these fields"
        const packages = await PackageModel.find().select('-image -images');
        
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
        
        // We leave this one alone because loading ONE image is usually 
        // okay for the phone. It's loading ALL of them at once that crashes it.
        const pkg = await PackageModel.findById(id);

        if (!pkg) return res.status(404).json({ message: "Package not found" });

        res.status(200).json(pkg);
    } catch (err) {
        console.error("getPackage error:", err);
        res.status(500).json({ error: err.message });
    }
};