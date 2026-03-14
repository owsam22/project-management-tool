import * as taskService from '../services/task.service.js';

export const create = async (req, res, next) => {
  try {
    const task = await taskService.createTask(req.body, req.user.userId);
    req.app.get('io')?.to(`project_${req.body.projectId}`).emit('task_created', task);
    res.status(201).json({ status: 'success', data: task });
  } catch (error) {
    next(error);
  }
};

export const getByList = async (req, res, next) => {
  try {
    const tasks = await taskService.getTasksByList(req.params.listId);
    res.status(200).json({ status: 'success', data: tasks });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(req.params.taskId);
    if (!task) throw { statusCode: 404, message: 'Task not found' };
    res.status(200).json({ status: 'success', data: task });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const task = await taskService.updateTask(req.params.taskId, req.body, req.user.userId);
    req.app.get('io')?.to(`project_${req.body.projectId}`).emit('task_updated', task);
    res.status(200).json({ status: 'success', data: task });
  } catch (error) {
    next(error);
  }
};

export const move = async (req, res, next) => {
  try {
    const { newListId, newPosition, projectId } = req.body;
    const task = await taskService.moveTask(req.params.taskId, newListId, newPosition, req.user.userId);
    req.app.get('io')?.to(`project_${projectId}`).emit('task_moved', { task, newListId, newPosition });
    res.status(200).json({ status: 'success', data: task });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    await taskService.deleteTask(req.params.taskId);
    res.status(200).json({ status: 'success', message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
};

export const getDependencies = async (req, res, next) => {
  try {
    const deps = await taskService.getTaskDependencies(req.params.taskId);
    res.status(200).json({ status: 'success', data: deps });
  } catch (error) {
    next(error);
  }
};

export const addDependency = async (req, res, next) => {
  try {
    const task = await taskService.addDependency(req.params.taskId, req.body.dependencyId);
    res.status(200).json({ status: 'success', data: task });
  } catch (error) {
    next(error);
  }
};

export const removeDependency = async (req, res, next) => {
  try {
    const task = await taskService.removeDependency(req.params.taskId, req.params.depId);
    res.status(200).json({ status: 'success', data: task });
  } catch (error) {
    next(error);
  }
};

export const checkHealth = async (req, res, next) => {
  try {
    const health = await taskService.evaluateTaskHealth(req.params.taskId);
    res.status(200).json({ status: 'success', data: { health } });
  } catch (error) {
    next(error);
  }
};
