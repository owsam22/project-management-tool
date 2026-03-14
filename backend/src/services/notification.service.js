import { Notification } from '../models/notification.model.js';

export const createNotification = async (userId, type, message, projectId = null, taskId = null) => {
  return await Notification.create({ userId, type, message, projectId, taskId });
};

export const getUserNotifications = async (userId) => {
  return await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(50);
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
