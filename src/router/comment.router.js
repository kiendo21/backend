import { Router } from 'express';
import CommentController from '../controllers/comment.controller.js';
import { authenticate, optionalAuthenticate, requireAdmin } from '../middlewares/auth.middleware.js';

const commentRouter = Router();

commentRouter.get('/user/me', authenticate, CommentController.getMyComments);
commentRouter.get('/:movieId', optionalAuthenticate, CommentController.getComments);
commentRouter.post('/:movieId', authenticate, CommentController.addComment);
commentRouter.post('/:commentId/replies', authenticate, CommentController.addReply);
commentRouter.post('/:commentId/like', authenticate, CommentController.toggleLike);
commentRouter.delete('/:commentId', authenticate, requireAdmin, CommentController.deleteComment);

export default commentRouter;
