import axios from 'axios';
import Package from '../models/package.js';
import mongoose from 'mongoose';

const AI_SERVICE_URL = String(
    process.env.AI_SERVICE_URL ||
    'https://recommendationtravex.onrender.com'
).replace(/\/$/, '');

const AI_SERVICE_TIMEOUT = Number(
    process.env.AI_SERVICE_TIMEOUT || 60000
);

const aiService = axios.create({
    baseURL: AI_SERVICE_URL,
    timeout: AI_SERVICE_TIMEOUT,
    headers: {
        Accept: 'application/json'
    }
});


//get fallback packages from database if AI service fails or returns empty
const getFallbackPackages = async (limit = 5) => {
    return Package.find({})
        .sort({
            averageRating: -1,
            createdAt: -1
        })
        .limit(limit)
        .lean()
        .exec();
};


//normalize recommendation item to ensure consistent structure
const normalizeRecommendation = (item) => {
    if (typeof item === 'string') {
        return {
            packageId: item,
            packageName: null
        };
    }

    if (!item || typeof item !== 'object') {
        return null;
    }

    return {
        packageId: item.packageId || item._id || item.id || null,
        packageName: item.packageName || item.name || null
    };
};


//get recommendations for a user function
const getRecommendations = async (req, res) => {
    const userId = req.userId
        ? String(req.userId)
        : null;

    if (!userId) {
        console.warn('[Recommendations] Missing req.userId');

        return res.status(401).json({
            message: 'User not authenticated'
        });
    }

    try {
        console.log(
            `[Recommendations] Fetching recommendations for user ${userId}`
        );

        const response = await aiService.get(
            `/recommend/${encodeURIComponent(userId)}`
        );

        const payload = response.data || {};

        if (payload.error) {
            throw new Error(payload.error);
        }

        // Supports different response names from the Python service.
        const rawRecommendations = Array.isArray(payload.recommendations)
            ? payload.recommendations
            : Array.isArray(payload.packages)
                ? payload.packages
                : Array.isArray(payload.tours)
                    ? payload.tours
                    : [];

        const recommendations = rawRecommendations
            .map(normalizeRecommendation)
            .filter(Boolean);

        // AI returned an empty result.
        if (recommendations.length === 0) {
            const fallbackPackages = await getFallbackPackages();

            return res.status(200).json({
                packages: fallbackPackages,
                tours: fallbackPackages,
                method: payload.method || 'database-fallback',
                count: fallbackPackages.length,
                fallback: true
            });
        }

        const objectIds = recommendations
            .map((item) => item.packageId)
            .filter(
                (id) =>
                    id &&
                    mongoose.Types.ObjectId.isValid(id)
            )
            .map(
                (id) =>
                    new mongoose.Types.ObjectId(id)
            );

        const packageNames = recommendations
            .map((item) => item.packageName)
            .filter(Boolean);

        const filters = [];

        if (objectIds.length > 0) {
            filters.push({
                _id: {
                    $in: objectIds
                }
            });
        }

        if (packageNames.length > 0) {
            filters.push({
                packageName: {
                    $in: packageNames
                }
            });
        }

        const packagesFromDb =
            filters.length > 0
                ? await Package.find({
                    $or: filters
                })
                    .lean()
                    .exec()
                : [];

        const packageById = new Map(
            packagesFromDb.map((pkg) => [
                String(pkg._id),
                pkg
            ])
        );

        const packageByName = new Map(
            packagesFromDb.map((pkg) => [
                String(pkg.packageName)
                    .trim()
                    .toLowerCase(),
                pkg
            ])
        );

        const seen = new Set();
        const orderedPackages = [];

        // Preserve the order returned by the AI.
        for (const recommendation of recommendations) {
            const idKey = recommendation.packageId
                ? String(recommendation.packageId)
                : null;

            const nameKey = recommendation.packageName
                ? String(recommendation.packageName)
                    .trim()
                    .toLowerCase()
                : null;

            const pkg =
                (idKey
                    ? packageById.get(idKey)
                    : null) ||
                (nameKey
                    ? packageByName.get(nameKey)
                    : null);

            // Do not include incomplete AI-only package objects.
            if (!pkg) {
                continue;
            }

            const pkgId = String(pkg._id);

            if (seen.has(pkgId)) {
                continue;
            }

            seen.add(pkgId);
            orderedPackages.push(pkg);
        }

        // The AI returned IDs or names that do not exist in MongoDB.
        if (orderedPackages.length === 0) {
            const fallbackPackages = await getFallbackPackages();

            return res.status(200).json({
                packages: fallbackPackages,
                tours: fallbackPackages,
                method: 'database-fallback',
                count: fallbackPackages.length,
                fallback: true
            });
        }

        return res.status(200).json({
            packages: orderedPackages,
            tours: orderedPackages,
            method: payload.method || 'ai',
            count: orderedPackages.length,
            fallback: false
        });
    } catch (error) {
        const isTimeout =
            error.code === 'ECONNABORTED' ||
            String(error.message || '')
                .toLowerCase()
                .includes('timeout');

        const upstreamStatus =
            error.response?.status || null;

        const upstreamData =
            error.response?.data || null;

        console.error(
            '[Recommendations] AI request failed:',
            {
                message: error.message,
                code: error.code,
                upstreamStatus,
                upstreamData
            }
        );

        // Return database packages instead of breaking the Home screen.
        try {
            const fallbackPackages =
                await getFallbackPackages();

            return res.status(200).json({
                packages: fallbackPackages,
                tours: fallbackPackages,
                method: isTimeout
                    ? 'database-fallback-timeout'
                    : 'database-fallback-error',
                count: fallbackPackages.length,
                fallback: true,
                warning: isTimeout
                    ? 'Recommendation service timed out'
                    : 'Recommendation service unavailable'
            });
        } catch (fallbackError) {
            console.error(
                '[Recommendations] Database fallback failed:',
                fallbackError.message
            );

            return res.status(503).json({
                message:
                    'Recommendations are temporarily unavailable',
                error: error.message
            });
        }
    }
};


//trigger AI model training function
const trainModels = async (req, res) => {
    try {
        const response = await aiService.post('/train');

        res.json({
            status: response.data.status,
            message: response.data.message,
            models_ready: response.data.models_ready
        });
    } catch (err) {
        console.error(
            '[Train] Error:',
            error.response?.data || error.message
        );

        return res.status(503).json({
            message: 'Unable to trigger model training',
            error:
                error.response?.data?.error ||
                error.message
        });
    }
};


//check AI service health function
const checkHealth = async (req, res) => {
    try {
        const response = await aiService.get('/health');

        return res.status(200).json({
            status:
                response.data?.status || 'healthy',
            models_ready: Boolean(
                response.data?.models_ready
            ),
            aiServiceUrl: AI_SERVICE_URL
        });
    } catch (error) {
        console.error(
            '[Health] Error:',
            error.response?.data || error.message
        );

        return res.status(503).json({
            status: 'unhealthy',
            error:
                error.response?.data?.error ||
                error.message,
            aiServiceUrl: AI_SERVICE_URL
        });
    }
};

export {
    checkHealth,
    getRecommendations,
    trainModels
}
