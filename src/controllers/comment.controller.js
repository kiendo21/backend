import Comment from '../models/comment.model.js';

const CommentController = {
    getComments: async (req, res) => {
        try {
            const { movieId } = req.params;
            // Populate userId to get username
            const comments = await Comment.find({ movieId })
                                          .populate('userId', 'username')
                                          .sort({ createdAt: -1 });
            return res.status(200).json({ data: comments });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching comments', error: error.message });
        }
    },

    getMyComments: async (req, res) => {
        try {
            const userId = req.user.id;
            const comments = await Comment.find({ userId })
                                          .sort({ createdAt: -1 });
            return res.status(200).json({ data: comments });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching user comments', error: error.message });
        }
    },

    addComment: async (req, res) => {
        try {
            const userId = req.user.id;
            const { movieId } = req.params;
            const { content, rating } = req.body;

            if (!content || !rating) {
                return res.status(400).json({ message: 'Comment content and rating are required' });
            }

            const comment = await Comment.create({ userId, movieId, content, rating });
            
            // Populate user info before returning
            await comment.populate('userId', 'username');

            return res.status(201).json({ message: 'Comment added', data: comment });
        } catch (error) {
            res.status(500).json({ message: 'Error adding comment', error: error.message });
        }
    }
};

export default CommentController;
