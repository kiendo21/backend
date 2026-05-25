import Wishlist from '../models/wishlist.model.js';

const WishlistController = {
    getWishlist: async (req, res) => {
        try {
            const userId = req.user.id;
            const items = await Wishlist.find({ userId }).sort({ createdAt: -1 });
            return res.status(200).json({ data: items });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching wishlist', error: error.message });
        }
    },

    addToWishlist: async (req, res) => {
        try {
            const userId = req.user.id;
            const { movieId, movieData } = req.body;

            if (!movieId || !movieData) {
                return res.status(400).json({ message: 'movieId and movieData are required' });
            }

            const exists = await Wishlist.findOne({ userId, movieId });
            if (exists) {
                return res.status(400).json({ message: 'Movie already in wishlist' });
            }

            const item = await Wishlist.create({ userId, movieId, movieData });
            return res.status(201).json({ message: 'Added to wishlist', data: item });
        } catch (error) {
            res.status(500).json({ message: 'Error adding to wishlist', error: error.message });
        }
    },

    removeFromWishlist: async (req, res) => {
        try {
            const userId = req.user.id;
            const { movieId } = req.params;

            const deleted = await Wishlist.findOneAndDelete({ userId, movieId });
            if (!deleted) {
                return res.status(404).json({ message: 'Item not found in wishlist' });
            }
            return res.status(200).json({ message: 'Removed from wishlist' });
        } catch (error) {
            res.status(500).json({ message: 'Error removing from wishlist', error: error.message });
        }
    }
};

export default WishlistController;
