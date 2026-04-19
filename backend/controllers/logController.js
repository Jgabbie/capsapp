import Log from '../models/log.js';
import Audit from '../models/audit.js';

export const getLogs = async (req, res) => {
    try {
        const logs = await Log.find()
            .populate('performedBy', 'username email role') 
            .sort({ timestamp: -1 });

        return res.status(200).json(logs);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching logs: " + error.message });
    }
};

export const getAudits = async (req, res) => {
    try {
        const audits = await Audit.find()
            .populate('performedBy', 'username email role')
            .sort({ timestamp: -1 });

        return res.status(200).json(audits);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching audits: " + error.message });
    }
};