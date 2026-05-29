import Comment from '../models/comment.model.js';
import User from '../models/user.model.js';

const ensureCanComment = async (userId) => {
    const user = await User.findById(userId).select('commentBannedUntil commentBanLabel');
    const bannedUntil = user?.commentBannedUntil;

    if (bannedUntil && new Date(bannedUntil).getTime() > Date.now()) {
        const untilText = user.commentBanLabel === 'Vĩnh viễn'
            ? 'vĩnh viễn'
            : `đến ${new Date(bannedUntil).toLocaleDateString('vi-VN')}`;
        const error = new Error(`Tài khoản của bạn bị cấm bình luận ${untilText}.`);
        error.statusCode = 403;
        throw error;
    }
};

const formatComment = (comment, userId = null) => {
    const obj = comment.toObject ? comment.toObject() : comment;
    const currentUserId = userId ? String(userId) : null;
    const likes = obj.likes || [];
    const replies = obj.replies || [];

    return {
        ...obj,
        likeCount: likes.length,
        replyCount: replies.length,
        isLiked: currentUserId ? likes.some((id) => String(id) === currentUserId) : false,
        replies: replies.map((reply) => ({
            ...reply,
            likeCount: (reply.likes || []).length,
            isLiked: currentUserId ? (reply.likes || []).some((id) => String(id) === currentUserId) : false,
        })),
    };
};

const CommentController = {
    getComments: async (req, res) => {
        try {
            const { movieId } = req.params;
            // Populate userId to get username
            const comments = await Comment.find({ movieId })
                                          .populate('userId', 'username')
                                          .populate('replies.userId', 'username')
                                          .sort({ createdAt: -1 });
            return res.status(200).json({ data: comments.map((comment) => formatComment(comment, req.user?.id)) });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching comments', error: error.message });
        }
    },

    getMyComments: async (req, res) => {
        try {
            const userId = req.user.id;
            const comments = await Comment.find({ userId })
                                          .populate('replies.userId', 'username')
                                          .sort({ createdAt: -1 });
            return res.status(200).json({ data: comments.map((comment) => formatComment(comment, userId)) });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching user comments', error: error.message });
        }
    },

    addComment: async (req, res) => {
        try {
            const userId = req.user.id;
            await ensureCanComment(userId);
            const { movieId } = req.params;
            const { content, rating, title, poster, releaseDate } = req.body;

            if (!content || !rating) {
                return res.status(400).json({ message: 'Comment content and rating are required' });
            }

            const comment = await Comment.create({
                userId,
                movieId,
                title,
                poster,
                releaseDate,
                content,
                rating
            });
            
            // Populate user info before returning
            await comment.populate('userId', 'username');

            return res.status(201).json({ message: 'Comment added', data: formatComment(comment, userId) });
        } catch (error) {
            res.status(error.statusCode || 500).json({ message: error.statusCode ? error.message : 'Error adding comment', error: error.message });
        }
    },

    addReply: async (req, res) => {
        try {
            const userId = req.user.id;
            await ensureCanComment(userId);
            const { commentId } = req.params;
            const { content } = req.body;

            if (!content?.trim()) {
                return res.status(400).json({ message: 'Reply content is required' });
            }

            const comment = await Comment.findById(commentId);
            if (!comment) {
                return res.status(404).json({ message: 'Comment not found' });
            }

            comment.replies.push({ userId, content: content.trim() });
            await comment.save();
            await comment.populate('userId', 'username');
            await comment.populate('replies.userId', 'username');

            return res.status(201).json({ message: 'Reply added', data: formatComment(comment, userId) });
        } catch (error) {
            res.status(error.statusCode || 500).json({ message: error.statusCode ? error.message : 'Error adding reply', error: error.message });
        }
    },

    toggleLike: async (req, res) => {
        try {
            const userId = req.user.id;
            const { commentId } = req.params;
            const comment = await Comment.findById(commentId);

            if (!comment) {
                return res.status(404).json({ message: 'Comment not found' });
            }

            const liked = comment.likes.some((id) => String(id) === String(userId));
            comment.likes = liked
                ? comment.likes.filter((id) => String(id) !== String(userId))
                : [...comment.likes, userId];
            await comment.save();
            await comment.populate('userId', 'username');
            await comment.populate('replies.userId', 'username');

            return res.status(200).json({ message: liked ? 'Comment unliked' : 'Comment liked', data: formatComment(comment, userId) });
        } catch (error) {
            res.status(500).json({ message: 'Error toggling comment like', error: error.message });
        }
    },

    deleteComment: async (req, res) => {
        try {
            const { commentId } = req.params;
            const deleted = await Comment.findByIdAndDelete(commentId);
            if (!deleted) {
                return res.status(404).json({ message: 'Comment not found' });
            }
            return res.status(200).json({ message: 'Comment deleted' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting comment', error: error.message });
        }
    }
};

export default CommentController;
