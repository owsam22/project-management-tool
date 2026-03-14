import { Router } from 'express';
import { create, getByList, getById, update, move, remove, getDependencies, addDependency, removeDependency, checkHealth } from '../controllers/task.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate);

router.post('/', create);
router.get('/list/:listId', getByList);
router.get('/:taskId', getById);
router.patch('/:taskId', update);
router.patch('/:taskId/move', move);
router.delete('/:taskId', remove);

// Dependencies
router.get('/:taskId/dependencies', getDependencies);
router.post('/:taskId/dependencies', addDependency);
router.delete('/:taskId/dependencies/:depId', removeDependency);

// Health
router.get('/:taskId/health', checkHealth);

export default router;
