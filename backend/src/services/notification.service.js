import { Notification } from '../models/notification.model.js';
import { ProjectMember } from '../models/projectMember.model.js';

export const createNotification = async (userId, type, message, projectId = null, taskId = null, extra = {}) => {
  return await Notification.create({ userId, type, message, projectId, taskId, ...extra });
};

export const getUserNotifications = async (userId) => {
  return await Notification.find({ userId })
    .populate('projectId', 'name')
    .sort({ createdAt: -1 })
    .limit(50);
};

export const getUnreadCount = async (userId) => {
  return await Notification.countDocuments({ userId, read: false });
};

export const markAsRead = async (notificationId, userId) => {
  return await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { read: true },
    { new: true }
  );
};

export const markAllAsRead = async (userId) => {
  return await Notification.updateMany({ userId, read: false }, { read: true });
};

export const respondToInvite = async (notificationId, userId, action) => {
  const notification = await Notification.findOne({
    _id: notificationId,
    userId,
    type: 'PROJECT_INVITE',
    status: 'PENDING',
  });

  if (!notification) {
    throw { statusCode: 404, message: 'Invite notification not found or already responded' };
  }

  if (action === 'accept') {
    const { projectId, role } = notification.actionData;

    // Check if already a member (edge case)
    const existing = await ProjectMember.findOne({ projectId, userId });
    if (!existing) {
      await ProjectMember.create({ projectId, userId, role: role || 'MEMBER' });
    }

    notification.status = 'ACCEPTED';
    notification.read = true;
    await notification.save();

    return { accepted: true, projectId };
  } else if (action === 'decline') {
    notification.status = 'DECLINED';
    notification.read = true;
    await notification.save();

    return { accepted: false };
  } else {
    throw { statusCode: 400, message: 'Action must be "accept" or "decline"' };
  }
};
