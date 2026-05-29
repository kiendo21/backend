import MovieReaction from '../models/movieReaction.model.js';

const reactionSummary = async (movieId, userId = null) => {
    const reactions = await MovieReaction.find({ movieId });
    const likes = reactions.filter((item) => item.reaction === 'like').length;
    const dislikes = reactions.filter((item) => item.reaction === 'dislike').length;
    const total = likes + dislikes;
    const myReaction = userId
        ? reactions.find((item) => String(item.userId) === String(userId))?.reaction || null
        : null;

    return {
        movieId,
        likes,
        dislikes,
        total,
        likePercent: total ? Math.round((likes / total) * 100) : 0,
        dislikePercent: total ? Math.round((dislikes / total) * 100) : 0,
        myReaction,
    };
};

const MovieReactionController = {
    getMyReactions: async (req, res) => {
        try {
            const userId = req.user.id;
            const reactions = await MovieReaction.find({ userId }).sort({ updatedAt: -1 });
            return res.status(200).json({ data: reactions });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching user reactions', error: error.message });
        }
    },

    getMovieReaction: async (req, res) => {
        try {
            const { movieId } = req.params;
            const data = await reactionSummary(movieId, req.user?.id);
            return res.status(200).json({ data });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching movie reactions', error: error.message });
        }
    },

    setMovieReaction: async (req, res) => {
        try {
            const userId = req.user.id;
            const { movieId } = req.params;
            const { reaction, title, poster, releaseDate } = req.body;

            if (!['like', 'dislike'].includes(reaction)) {
                return res.status(400).json({ message: 'Reaction must be like or dislike' });
            }

            await MovieReaction.findOneAndUpdate(
                { userId, movieId },
                { reaction, title, poster, releaseDate },
                { upsert: true, returnDocument: 'after' }
            );

            const data = await reactionSummary(movieId, userId);
            return res.status(200).json({ message: 'Reaction saved', data });
        } catch (error) {
            res.status(500).json({ message: 'Error saving movie reaction', error: error.message });
        }
    },

    clearMovieReaction: async (req, res) => {
        try {
            const userId = req.user.id;
            const { movieId } = req.params;

            await MovieReaction.findOneAndDelete({ userId, movieId });
            const data = await reactionSummary(movieId, userId);
            return res.status(200).json({ message: 'Reaction removed', data });
        } catch (error) {
            res.status(500).json({ message: 'Error removing movie reaction', error: error.message });
        }
    },
};

export default MovieReactionController;
