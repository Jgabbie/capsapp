import express from 'express';
import { addToWishlist, getWishlist, removeFromWishlist } from '../controllers/wishlistController.js';
import requireUser from '../middleware/requireUser.js';

const router = express.Router();

router.post('/add', requireUser, addToWishlist);
router.get('/', requireUser, getWishlist);
router.delete('/remove', requireUser, removeFromWishlist); // <--- CHANGE BACK TO DELETE

export default router;