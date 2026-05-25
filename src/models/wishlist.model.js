import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    movieId: {
        type: String, // String since TMDB ID could be large or string
        required: true
    },
    movieData: {
        type: Object, // Stores the full movie object from frontend
        required: true
    }
}, { timestamps: true });

// A user should only be able to add a specific movie to wishlist once
wishlistSchema.index({ userId: 1, movieId: 1 }, { unique: true });

const Wishlist = mongoose.model('Wishlist', wishlistSchema);
export default Wishlist;
