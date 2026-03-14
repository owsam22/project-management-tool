import * as boardService from '../services/board.service.js';

export const getBoards = async (req, res, next) => {
  try {
    const boards = await boardService.getBoardsByProject(req.params.projectId);
    res.status(200).json({ status: 'success', data: boards });
  } catch (error) {
    next(error);
  }
};

export const createBoard = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) throw { statusCode: 400, message: 'Board name is required' };
    const board = await boardService.createBoard(req.params.projectId, name);
    res.status(201).json({ status: 'success', data: board });
  } catch (error) {
    next(error);
  }
};

export const getLists = async (req, res, next) => {
  try {
    const lists = await boardService.getListsByBoard(req.params.boardId);
    res.status(200).json({ status: 'success', data: lists });
  } catch (error) {
    next(error);
  }
};

export const createList = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) throw { statusCode: 400, message: 'List name is required' };
    const list = await boardService.createList(req.params.boardId, name);
    res.status(201).json({ status: 'success', data: list });
  } catch (error) {
    next(error);
  }
};

export const reorderLists = async (req, res, next) => {
  try {
    const { listIds } = req.body;
    if (!listIds || !Array.isArray(listIds)) throw { statusCode: 400, message: 'listIds array is required' };
    await boardService.reorderLists(req.params.boardId, listIds);
    res.status(200).json({ status: 'success', message: 'Lists reordered' });
  } catch (error) {
    next(error);
  }
};
