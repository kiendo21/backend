import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import dotenv from 'dotenv';
dotenv.config();

const AuthController = {
    register: async (req, res) => {
        try {
            const { username, email, password } = req.body;

            if (!username || !email || !password) {
                return res.status(400).json({ message: 'Username, email and password are required' });
            }

            const existingUser = await User.findOne({ $or: [{ email }, { username }] });
            if (existingUser) {
                return res.status(400).json({ message: 'Email or username already exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await User.create({ username, email, password: hashedPassword });
            
            const userResponse = { id: user._id, username: user.username, email: user.email };
            return res.status(201).json({ message: 'User registered successfully', data: userResponse });
        } catch (error) {
            res.status(500).json({ message: 'Error registering', error: error.message });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            
            if (!email || !password) {
                return res.status(400).json({ message: 'Email and password are required' });
            }

            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            const token = jwt.sign(
                { id: user._id },
                process.env.JWT_SECRET || 'ilovemoviehub',
                { expiresIn: '7d' }
            );

            return res.status(200).json({ 
                message: 'Logged in successfully', 
                token,
                user: { id: user._id, username: user.username, email: user.email }
            });
        } catch (error) {
            res.status(500).json({ message: 'Error logging in', error: error.message });
        }
    },

    getMe: async (req, res) => {
        try {
            const userId = req.user.id;
            const user = await User.findById(userId).select('-password');
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            return res.status(200).json({ data: user });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching user', error: error.message });
        }
    }
};

export default AuthController;
