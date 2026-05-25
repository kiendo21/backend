import { Router } from 'express';
import WishlistController from '../controllers/wishlist.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const wishlistRouter = Router();

wishlistRouter.get('/', authenticate, WishlistController.getWishlist);
wishlistRouter.post('/', authenticate, WishlistController.addToWishlist);
wishlistRouter.delete('/:movieId', authenticate, WishlistController.removeFromWishlist);

export default wishlistRouter;
