import { Comment } from '../models/comment.model.js';
import { ActivityLog } from '../models/activityLog.model.js';

export const getCommentsByTask = async (taskId) => {
  return await Comment.find({ taskId })
    .populate('userId', 'name email avatarUrl')
    .sort({ createdAt: 1 });
};

export const addComment = async (taskId, userId, message, attachmentUrl = '') => {
  const comment = await Comment.create({ taskId, userId, message, attachmentUrl });

  await ActivityLog.create({
    taskId,
    userId,
    type: 'COMMENT_ADDED',
    details: message.substring(0, 100),
  });

  return await comment.populate('userId', 'name email avatarUrl');
};

export const deleteComment = async (commentId, userId) => {
  const comment = await Comment.findById(commentId);
  if (!comment) throw { statusCode: 404, message: 'Comment not found' };
  if (comment.userId.toString() !== userId) {
    throw { statusCode: 403, message: 'You can only delete your own comments' };
  }
  await Comment.findByIdAndDelete(commentId);
};
