import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/user.model.js';
dotenv.config();

export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Unauthorized: No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ilovemoviehub');

        const user = await User.findById(decoded.id).select('role status');
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized: User not found' });
        }
        if ((user.status || 'active') === 'locked') {
            return res.status(403).json({ message: 'Account is locked' });
        }

        req.user = { id: decoded.id, role: user.role || 'user' };
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
             return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
        }
        res.status(500).json({ message: 'Error authenticating', error: error.message });
    }
};

export const optionalAuthenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ilovemoviehub');
        const user = await User.findById(decoded.id).select('role status');

        if (user && (user.status || 'active') !== 'locked') {
            req.user = { id: decoded.id, role: user.role || 'user' };
        }
        return next();
    } catch {
        return next();
    }
};

export const requireAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};

export default { authenticate, optionalAuthenticate, requireAdmin };
