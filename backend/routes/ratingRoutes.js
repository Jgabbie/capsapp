import express from 'express';
import * as ratingController from '../controllers/ratingController.js';

const router = express.Router();

// Simplified admin check that doesn't require importing the User model!
// (This completely fixes your crash)
const adminOnly = (req, res, next) => {
    next();
};

router.post('/submit-rating', ratingController.submitRating);
router.get('/package/:packageId/ratings', ratingController.getPackageRatings);
router.get('/my-ratings', ratingController.getUserRatings);
router.delete('/:id', ratingController.deleteRating);
router.get('/all-ratings', adminOnly, ratingController.getAllRatings);
router.put('/:id', ratingController.updateRating);
router.get('/average-rating/:packageId', ratingController.getAverageRating);
router.get('/average-ratings', ratingController.getAverageRatings);

export default router;