import { Router } from 'express';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, respondToInvite } from '../controllers/notification.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/read-all', markAllAsRead);
router.patch('/:notificationId/read', markAsRead);
router.post('/:notificationId/respond', respondToInvite);

export default router;
