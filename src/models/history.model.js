import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    movieId: {
        type: String,
        required: true
    },
    title: String,
    poster: String,
    releaseDate: String,
    watchedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// A user has one history record per movie (we update watchedAt if watched again)
historySchema.index({ userId: 1, movieId: 1 }, { unique: true });

const History = mongoose.model('History', historySchema);
export default History;
