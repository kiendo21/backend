import Rating from '../models/rating.model.js';

const RatingController = {
    addRating: async (req, res) => {
        try {
            const userId = req.user.id;
            const { movieId } = req.params;
            const { rating } = req.body;

            if (rating === undefined || rating < 1 || rating > 5) {
                return res.status(400).json({ message: 'Rating must be between 1 and 5' });
            }

            // Upsert: Create if not exists, update if exists
            const savedRating = await Rating.findOneAndUpdate(
                { userId, movieId },
                { rating },
                { new: true, upsert: true }
            );

            return res.status(201).json({ message: 'Rating saved', data: savedRating });
        } catch (error) {
            res.status(500).json({ message: 'Error saving rating', error: error.message });
        }
    },

    getMovieRating: async (req, res) => {
        try {
            const { movieId } = req.params;
            
            // Get all ratings for this movie to calculate average
            const ratings = await Rating.find({ movieId });
            
            if (ratings.length === 0) {
                return res.status(200).json({ data: { average: 0, count: 0 } });
            }

            const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0);
            const average = sum / ratings.length;

            return res.status(200).json({ 
                data: { 
                    average: Number(average.toFixed(1)), 
                    count: ratings.length 
                } 
            });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching rating', error: error.message });
        }
    }
};

export default RatingController;
