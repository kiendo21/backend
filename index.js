import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();

import { connectDB } from './src/configs/db.js';

// Import routers
import authRouter from './src/router/auth.router.js';
import wishlistRouter from './src/router/wishlist.router.js';
import historyRouter from './src/router/history.router.js';
import commentRouter from './src/router/comment.router.js';
import ratingRouter from './src/router/rating.router.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middlewares
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'MovieHub API is running' });
});

// Mount all API routes under /api
app.use('/api/auth', authRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/history', historyRouter);
app.use('/api/comments', commentRouter);
app.use('/api/ratings', ratingRouter);

// Global Error Handler (Optional but good practice)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something broke!', error: err.message });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
