import mongoose from 'mongoose';

const movieReactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    movieId: {
        type: String,
        required: true
    },
    reaction: {
        type: String,
        enum: ['like', 'dislike'],
        required: true
    },
    title: String,
    poster: String,
    releaseDate: String
}, { timestamps: true });

movieReactionSchema.index({ userId: 1, movieId: 1 }, { unique: true });

const MovieReaction = mongoose.model('MovieReaction', movieReactionSchema);
export default MovieReaction;
