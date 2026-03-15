import { Router } from 'express';
import { sendMessage, getProjectMessages } from '../controllers/chat.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate);

router.get('/:projectId', getProjectMessages);
router.post('/', sendMessage);

export default router;
