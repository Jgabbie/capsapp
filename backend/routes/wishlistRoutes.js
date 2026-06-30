import express from 'express';
import * as wishlistController from '../controllers/wishlistController.js';
import requireUser from '../middleware/requireUser.js';

const router = express.Router();

router.post('/add', requireUser, wishlistController.addToWishlist);
router.get('/', requireUser, wishlistController.getWishlist);
router.delete('/remove', requireUser, wishlistController.removeFromWishlist); // <--- CHANGE BACK TO DELETE

export default router;