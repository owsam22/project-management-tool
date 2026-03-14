import { Router } from 'express';
import { getDecisions, logDecision } from '../controllers/decision.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate);

router.get('/:taskId', getDecisions);
router.post('/:taskId', logDecision);

export default router;
