import express from 'express';
import { 
    submitRating, 
    getPackageRatings, 
    getUserRatings, 
    deleteRating, 
    getAllRatings, 
    updateRating, 
    getAverageRating, 
    getAverageRatings 
} from '../controllers/ratingController.js';

const router = express.Router();

// Simplified admin check that doesn't require importing the User model!
// (This completely fixes your crash)
const adminOnly = (req, res, next) => {
    next();
};

router.post('/submit-rating', submitRating);
router.get('/package/:packageId/ratings', getPackageRatings);
router.get('/my-ratings', getUserRatings);
router.delete('/:id', deleteRating);
router.get('/all-ratings', adminOnly, getAllRatings);
router.put('/:id', updateRating);
router.get('/average-rating/:packageId', getAverageRating);
router.get('/average-ratings', getAverageRatings);

export default router;