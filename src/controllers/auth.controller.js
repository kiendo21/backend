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

            const adminEmail = process.env.ADMIN_EMAIL || 'admin@gmail.com';
            const adminPassword = process.env.ADMIN_PASSWORD || '789789';
            const isBootstrapAdmin = email.toLowerCase() === adminEmail.toLowerCase() && password === adminPassword;

            const existingUser = await User.findOne({ $or: [{ email }, { username }] });
            if (existingUser) {
                if (isBootstrapAdmin && existingUser.email.toLowerCase() === adminEmail.toLowerCase()) {
                    existingUser.username = username;
                    existingUser.password = await bcrypt.hash(password, 10);
                    existingUser.role = 'admin';
                    existingUser.status = 'active';
                    await existingUser.save();

                    const userResponse = {
                        id: existingUser._id,
                        username: existingUser.username,
                        email: existingUser.email,
                        role: existingUser.role,
                        status: existingUser.status
                    };
                    return res.status(200).json({ message: 'Admin account updated successfully', data: userResponse });
                }
                return res.status(400).json({ message: 'Email or username already exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const adminEmails = (process.env.ADMIN_EMAILS || '')
                .split(',')
                .map((item) => item.trim().toLowerCase())
                .filter(Boolean);
            const role = isBootstrapAdmin || adminEmails.includes(email.toLowerCase()) ? 'admin' : 'user';
            const user = await User.create({ username, email, password: hashedPassword, role });
            
            const userResponse = { id: user._id, username: user.username, email: user.email, role: user.role, status: user.status };
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
            if ((user.status || 'active') === 'locked') {
                return res.status(403).json({ message: 'Account is locked' });
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
                user: { id: user._id, username: user.username, email: user.email, role: user.role || 'user', status: user.status || 'active' }
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
