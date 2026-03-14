import * as notifService from '../services/notification.service.js';

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await notifService.getUserNotifications(req.user.userId);
    res.status(200).json({ status: 'success', data: notifications });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const notification = await notifService.markAsRead(req.params.notificationId, req.user.userId);
    res.status(200).json({ status: 'success', data: notification });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    await notifService.markAllAsRead(req.user.userId);
    res.status(200).json({ status: 'success', message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};
