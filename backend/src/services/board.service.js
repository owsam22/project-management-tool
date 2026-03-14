import { Board } from '../models/board.model.js';
import { List } from '../models/list.model.js';

export const getBoardsByProject = async (projectId) => {
  return await Board.find({ projectId }).sort({ position: 1 });
};

export const createBoard = async (projectId, name) => {
  const count = await Board.countDocuments({ projectId });
  return await Board.create({ projectId, name, position: count });
};

export const getListsByBoard = async (boardId) => {
  return await List.find({ boardId }).sort({ position: 1 });
};

export const createList = async (boardId, name) => {
  const count = await List.countDocuments({ boardId });
  return await List.create({ boardId, name, position: count });
};

export const reorderLists = async (boardId, listIds) => {
  // listIds is an array of list IDs in the desired order
  await Promise.all(
    listIds.map((id, index) =>
      List.findByIdAndUpdate(id, { position: index })
    )
  );
};
