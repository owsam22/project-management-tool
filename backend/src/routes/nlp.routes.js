import { Router } from 'express';
import { extractTasks } from '../controllers/nlp.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate);

router.post('/extract-tasks', extractTasks);

export default router;
