import { Router } from 'express';
import { getComments, addComment, deleteComment } from '../controllers/comment.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate);

router.get('/:taskId', getComments);
router.post('/:taskId', addComment);
router.delete('/:commentId', deleteComment);

export default router;
