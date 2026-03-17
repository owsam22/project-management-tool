import * as notifService from '../services/notification.service.js';

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await notifService.getUserNotifications(req.user.userId);
    res.status(200).json({ status: 'success', data: notifications });
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await notifService.getUnreadCount(req.user.userId);
    res.status(200).json({ status: 'success', data: { count } });
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

export const respondToInvite = async (req, res, next) => {
  try {
    const { action } = req.body; // 'accept' or 'decline'
    if (!action) throw { statusCode: 400, message: 'Action (accept/decline) is required' };
    const result = await notifService.respondToInvite(req.params.notificationId, req.user.userId, action);
    
    // Real-time broadcast for join notifications
    const io = req.app.get('io');
    if (io && result.broadcastNotifications) {
      result.broadcastNotifications.forEach((notif) => {
        io.to(`user_${notif.userId}`).emit('notification_received', notif);
      });
    }

    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};
