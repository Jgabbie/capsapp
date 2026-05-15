import axios from 'axios';
import Package from '../models/package.js';
import { default as mongoose } from 'mongoose';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'https://recommendationtravex.onrender.com';
const AI_SERVICE_TIMEOUT = 10000; // 10 seconds

// Create axios instance for AI service
const aiService = axios.create({
    baseURL: AI_SERVICE_URL,
    timeout: AI_SERVICE_TIMEOUT
});

export const getRecommendations = async (req, res) => {
    try {
        const userId = req.userId ? String(req.userId) : null;
        if (!userId) {
            console.warn('[Recommendations] Rejected before AI call: missing req.userId')
            return res.status(401).json({ message: "User not authenticated" });
        }

        console.log(`[Recommendations] Fetching recommendations for user: ${userId}`);

        // Call the Python AI service
        const response = await aiService.get(`/recommend/${userId}`);
        console.log(`[Recommendations] AI response status: ${response.status}, method: ${response.data?.method || 'n/a'}, count: ${response.data?.recommendations?.length || 0}`)

        // Check if there was an error from the AI service
        if (response.data.error) {
            console.warn(`[Recommendations] AI Service error: ${response.data.error}`);
            return res.status(503).json({
                message: "AI Service error",
                error: response.data.error
            });
        }

        const recommendations = response.data.recommendations || [];
        const recommendedIds = recommendations.map(item => item.packageId || item._id || item).filter(Boolean);
        const recommendedNames = recommendations.map(item => item.packageName || '').filter(Boolean);

        if (recommendedIds.length === 0 && recommendedNames.length === 0) {
            console.warn(`[Recommendations] AI returned empty recommendation payload for user: ${userId}`);
            return res.json({ packages: [], tours: [], method: response.data.method || "none" });
        }

        console.log(`[Recommendations] Retrieved ${recommendations.length} recommendations using ${response.data.method}`);

        // Convert recommended id strings to ObjectId where valid
        const objectIds = recommendedIds
            .map(id => (mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null))
            .filter(Boolean);

        let packagesFromDb = [];
        if (objectIds.length > 0) {
            packagesFromDb = await Package.find({ _id: { $in: objectIds } }).lean().exec();
        }

        // Map by stringified _id for quick lookup
        const pkgMap = new Map(packagesFromDb.map(p => [String(p._id), p]));

        // Build ordered list preserving AI order. If DB record missing, keep a minimal fallback object.
        const orderedPackages = [];
        for (const rec of recommendations) {
            const recId = rec.packageId || rec._id || null;
            let pkg = recId ? pkgMap.get(String(recId)) : null;
            if (pkg) {
                orderedPackages.push(pkg);
                continue;
            }

            // Try matching by name when id lookup fails
            if (rec.packageName) {
                const byName = await Package.findOne({ packageName: rec.packageName }).lean().exec();
                if (byName) {
                    orderedPackages.push(byName);
                    continue;
                }
            }

            // As a last resort, include the AI-provided minimal info so caller receives same count
            orderedPackages.push({ _id: recId || null, packageName: rec.packageName || null });
        }

        res.json({
            packages: orderedPackages,
            tours: orderedPackages,
            method: response.data.method,
            count: orderedPackages.length
        });
    } catch (err) {
        console.error(`[Recommendations] Error: ${err.message}`);

        if (err.code === 'ECONNREFUSED') {
            return res.status(503).json({
                message: "AI Service is offline",
                error: "Cannot connect to recommendation service"
            });
        }

        if (err.response?.status === 503) {
            return res.status(503).json({
                message: "AI Service is temporarily unavailable",
                error: err.response?.data?.error
            });
        }

        res.status(500).json({
            message: "Error fetching recommendations",
            error: err.message
        });
    }
};

/**
 * Trigger manual model training/retraining
 * Called after significant user interactions or on a schedule
 */
export const trainModels = async (req, res) => {
    try {
        console.log("[Train] Triggering model training...");

        const response = await aiService.post('/train');

        res.json({
            status: response.data.status,
            message: response.data.message,
            models_ready: response.data.models_ready
        });
    } catch (err) {
        console.error(`[Train] Error: ${err.message}`);

        if (err.code === 'ECONNREFUSED') {
            return res.status(503).json({
                message: "AI Service is offline"
            });
        }

        res.status(500).json({
            message: "Error triggering model training",
            error: err.message
        });
    }
};

/**
 * Check AI Service health and model status
 */
export const checkHealth = async (req, res) => {
    try {
        const response = await aiService.get('/health');

        res.json({
            status: response.data.status,
            models_ready: response.data.models_ready
        });
    } catch (err) {
        console.error(`[Health] Error: ${err.message}`);

        res.status(503).json({
            status: "unhealthy",
            error: err.message
        });
    }
};
