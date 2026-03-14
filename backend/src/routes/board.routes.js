import { Router } from 'express';
import { getBoards, createBoard, getLists, createList, reorderLists } from '../controllers/board.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate);

// Board operations within a project
router.get('/project/:projectId', getBoards);
router.post('/project/:projectId', createBoard);

// List operations within a board
router.get('/:boardId/lists', getLists);
router.post('/:boardId/lists', createList);
router.patch('/:boardId/lists/reorder', reorderLists);

export default router;
