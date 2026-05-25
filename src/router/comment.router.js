import { Router } from 'express';
import CommentController from '../controllers/comment.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const commentRouter = Router();

commentRouter.get('/user/me', authenticate, CommentController.getMyComments);
commentRouter.get('/:movieId', CommentController.getComments);
commentRouter.post('/:movieId', authenticate, CommentController.addComment);

export default commentRouter;
