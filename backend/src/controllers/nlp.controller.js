import { extractTasksFromNotes } from '../services/nlp.service.js';

export const extractTasks = async (req, res, next) => {
  try {
    const { notes } = req.body;
    if (!notes) throw { statusCode: 400, message: 'Meeting notes text is required' };
    const tasks = extractTasksFromNotes(notes);
    res.status(200).json({ status: 'success', data: { tasks, count: tasks.length } });
  } catch (error) {
    next(error);
  }
};
