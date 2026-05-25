import { Router } from 'express';
import HistoryController from '../controllers/history.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const historyRouter = Router();

historyRouter.get('/', authenticate, HistoryController.getHistory);
historyRouter.post('/', authenticate, HistoryController.addToHistory);

export default historyRouter;
