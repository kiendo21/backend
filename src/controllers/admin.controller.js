import User from '../models/user.model.js';
import Comment from '../models/comment.model.js';
import History from '../models/history.model.js';
import Wishlist from '../models/wishlist.model.js';
import MovieReaction from '../models/movieReaction.model.js';

const AdminController = {
    getUsers: async (req, res) => {
        try {
            const users = await User.find().select('-password').sort({ createdAt: -1 });
            return res.status(200).json({ data: users });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching users', error: error.message });
        }
    },

    updateUserStatus: async (req, res) => {
        try {
            const { userId } = req.params;
            const { status } = req.body;

            if (!['active', 'locked'].includes(status)) {
                return res.status(400).json({ message: 'Status must be active or locked' });
            }

            if (String(userId) === String(req.user.id)) {
                return res.status(400).json({ message: 'Admin cannot lock own account' });
            }

            const user = await User.findByIdAndUpdate(
                userId,
                { status },
                { returnDocument: 'after' }
            ).select('-password');

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            return res.status(200).json({ message: 'User status updated', data: user });
        } catch (error) {
            res.status(500).json({ message: 'Error updating user status', error: error.message });
        }
    },

    banUserFromComments: async (req, res) => {
        try {
            const { userId } = req.params;
            const { duration } = req.body;
            const banOptions = {
                '7d': { ms: 7 * 24 * 60 * 60 * 1000, label: '7 ngày' },
                '30d': { ms: 30 * 24 * 60 * 60 * 1000, label: '30 ngày' },
                '180d': { ms: 180 * 24 * 60 * 60 * 1000, label: '6 tháng' },
                '1y': { ms: 365 * 24 * 60 * 60 * 1000, label: '1 năm' },
                permanent: { ms: 100 * 365 * 24 * 60 * 60 * 1000, label: 'Vĩnh viễn' },
                none: null,
            };

            if (!(duration in banOptions)) {
                return res.status(400).json({ message: 'Invalid ban duration' });
            }

            if (String(userId) === String(req.user.id)) {
                return res.status(400).json({ message: 'Admin cannot ban own comments' });
            }

            const option = banOptions[duration];
            const update = option
                ? { commentBannedUntil: new Date(Date.now() + option.ms), commentBanLabel: option.label }
                : { $unset: { commentBannedUntil: '', commentBanLabel: '' } };

            const user = await User.findByIdAndUpdate(
                userId,
                update,
                { returnDocument: 'after' }
            ).select('-password');

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            return res.status(200).json({ message: option ? 'User comment ban updated' : 'User comment ban removed', data: user });
        } catch (error) {
            res.status(500).json({ message: 'Error updating comment ban', error: error.message });
        }
    },

    getComments: async (req, res) => {
        try {
            const comments = await Comment.find()
                .populate('userId', 'username email commentBannedUntil commentBanLabel')
                .sort({ createdAt: -1 })
                .limit(100);
            return res.status(200).json({ data: comments });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching comments', error: error.message });
        }
    },

    getStats: async (req, res) => {
        try {
            const [
                userCount,
                commentCount,
                historyCount,
                wishlistCount,
                reactionCount,
                hotHistory,
                hotWishlist,
                hotReactions,
            ] = await Promise.all([
                User.countDocuments(),
                Comment.countDocuments(),
                History.countDocuments(),
                Wishlist.countDocuments(),
                MovieReaction.countDocuments(),
                History.aggregate([
                    { $group: { _id: '$movieId', count: { $sum: 1 }, title: { $first: '$title' }, poster: { $first: '$poster' } } },
                    { $sort: { count: -1 } },
                    { $limit: 5 },
                ]),
                Wishlist.aggregate([
                    { $group: { _id: '$movieId', count: { $sum: 1 }, movieData: { $first: '$movieData' } } },
                    { $sort: { count: -1 } },
                    { $limit: 5 },
                ]),
                MovieReaction.aggregate([
                    { $match: { reaction: 'like' } },
                    { $group: { _id: '$movieId', count: { $sum: 1 }, title: { $first: '$title' }, poster: { $first: '$poster' } } },
                    { $sort: { count: -1 } },
                    { $limit: 5 },
                ]),
            ]);

            return res.status(200).json({
                data: {
                    totals: {
                        users: userCount,
                        comments: commentCount,
                        views: historyCount,
                        wishlist: wishlistCount,
                        reactions: reactionCount,
                    },
                    hotMovies: {
                        byViews: hotHistory,
                        byWishlist: hotWishlist.map((item) => ({
                            _id: item._id,
                            count: item.count,
                            title: item.movieData?.title,
                            poster: item.movieData?.thumb,
                        })),
                        byLikes: hotReactions,
                    },
                },
            });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching stats', error: error.message });
        }
    },
};

export default AdminController;
