import History from '../models/history.model.js';

const HistoryController = {
    getHistory: async (req, res) => {
        try {
            const userId = req.user.id;
            const history = await History.find({ userId }).sort({ watchedAt: -1 });
            return res.status(200).json({ data: history });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching history', error: error.message });
        }
    },

    addToHistory: async (req, res) => {
        try {
            const userId = req.user.id;
            const { movieId, title, poster, releaseDate } = req.body;

            if (!movieId) {
                return res.status(400).json({ message: 'movieId is required' });
            }

            // Update watchedAt if exists, else create new
            const history = await History.findOneAndUpdate(
                { userId, movieId },
                { title, poster, releaseDate, watchedAt: Date.now() },
                { new: true, upsert: true }
            );

            return res.status(201).json({ message: 'History updated', data: history });
        } catch (error) {
            res.status(500).json({ message: 'Error updating history', error: error.message });
        }
    }
};

export default HistoryController;
