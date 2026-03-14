import { Router } from 'express';
import { getWorkload, getSilentMembers, getProjectHealth } from '../controllers/analytics.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate);

router.get('/:projectId/workload', getWorkload);
router.get('/:projectId/silent-members', getSilentMembers);
router.get('/:projectId/health', getProjectHealth);

export default router;
