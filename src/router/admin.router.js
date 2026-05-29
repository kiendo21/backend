import { Router } from 'express';
import AdminController from '../controllers/admin.controller.js';
import CommentController from '../controllers/comment.controller.js';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware.js';

const adminRouter = Router();

adminRouter.use(authenticate, requireAdmin);

adminRouter.get('/users', AdminController.getUsers);
adminRouter.patch('/users/:userId/status', AdminController.updateUserStatus);
adminRouter.patch('/users/:userId/comment-ban', AdminController.banUserFromComments);
adminRouter.get('/comments', AdminController.getComments);
adminRouter.delete('/comments/:commentId', CommentController.deleteComment);
adminRouter.get('/stats', AdminController.getStats);

export default adminRouter;
