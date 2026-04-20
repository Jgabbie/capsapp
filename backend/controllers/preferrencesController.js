import Preferrences from "../models/preferrences.js";
import logAction from "../utils/logger.js"; // 🔥 Tracking added!

export const savePreferrences = async (req, res) => {
    try {
        const userId = req.userId;
        const { moods = [], tours = [], pace = [] } = req.body || {};

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const updated = await Preferrences.findOneAndUpdate(
            { userId },
            { moods, tours, pace },
            // 🔥 FIX 3: Replaced 'new: true' with 'returnDocument: "after"' to clear Mongoose warning
            { returnDocument: 'after', upsert: true } 
        );

        // 🔥 LOG ACTION: Track preference updates
        if (typeof logAction === 'function') {
            logAction('UPDATE_PREFERENCES', userId, { "Preferences": "User updated their travel moodboard" });
        }

        res.status(200).json({ success: true, preferrences: updated });
    } catch (e) {
        res.status(500).json({ message: 'Save preferences failed: ' + e.message });
    }
};

export const getMyPreferrences = async (req, res) => {
    try {
        const userId = req.userId;
        const pref = await Preferrences.findOne({ userId });
        res.status(200).json({ success: true, preferrences: pref });
    } catch (e) {
        res.status(500).json({ message: 'Get preferences failed: ' + e.message });
    }
};