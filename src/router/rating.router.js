import { Router } from 'express';
import RatingController from '../controllers/rating.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const ratingRouter = Router();

ratingRouter.get('/user/me', authenticate, RatingController.getMyRatings);
ratingRouter.get('/:movieId', RatingController.getMovieRating);
ratingRouter.post('/:movieId', authenticate, RatingController.addRating);

export default ratingRouter;
