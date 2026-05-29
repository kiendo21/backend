import { Router } from 'express';
import MovieReactionController from '../controllers/movieReaction.controller.js';
import { authenticate, optionalAuthenticate } from '../middlewares/auth.middleware.js';

const movieReactionRouter = Router();

movieReactionRouter.get('/user/me', authenticate, MovieReactionController.getMyReactions);
movieReactionRouter.get('/:movieId', optionalAuthenticate, MovieReactionController.getMovieReaction);
movieReactionRouter.post('/:movieId', authenticate, MovieReactionController.setMovieReaction);
movieReactionRouter.delete('/:movieId', authenticate, MovieReactionController.clearMovieReaction);

export default movieReactionRouter;
