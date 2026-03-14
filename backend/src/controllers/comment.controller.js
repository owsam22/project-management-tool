import * as commentService from '../services/comment.service.js';

export const getComments = async (req, res, next) => {
  try {
    const comments = await commentService.getCommentsByTask(req.params.taskId);
    res.status(200).json({ status: 'success', data: comments });
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const { message, attachmentUrl } = req.body;
    if (!message) throw { statusCode: 400, message: 'Message is required' };
    const comment = await commentService.addComment(req.params.taskId, req.user.userId, message, attachmentUrl);
    req.app.get('io')?.to(`task_${req.params.taskId}`).emit('comment_added', comment);
    res.status(201).json({ status: 'success', data: comment });
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    await commentService.deleteComment(req.params.commentId, req.user.userId);
    res.status(200).json({ status: 'success', message: 'Comment deleted' });
  } catch (error) {
    next(error);
  }
};
