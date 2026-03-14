import { Router } from 'express';
import { create, list, getById, invite, leave } from '../controllers/project.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', list);
router.post('/', create);
router.get('/:projectId', getById);
router.post('/:projectId/members', invite);
router.delete('/:projectId/leave', leave);

export default router;
