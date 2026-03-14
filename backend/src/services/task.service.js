import { Task } from '../models/task.model.js';
import { ActivityLog } from '../models/activityLog.model.js';

export const createTask = async (data, userId) => {
  const task = await Task.create({ ...data, createdBy: userId });

  await ActivityLog.create({
    taskId: task._id,
    userId,
    type: 'TASK_CREATED',
    details: `Created task: ${task.title}`,
  });

  return task;
};

export const getTasksByList = async (listId) => {
  return await Task.find({ listId })
    .populate('assignees', 'name email avatarUrl')
    .populate('createdBy', 'name email')
    .sort({ position: 1 });
};

export const getTaskById = async (taskId) => {
  return await Task.findById(taskId)
    .populate('assignees', 'name email avatarUrl')
    .populate('dependencies', 'title status')
    .populate('createdBy', 'name email');
};

export const updateTask = async (taskId, data, userId) => {
  const task = await Task.findByIdAndUpdate(taskId, data, { new: true });

  await ActivityLog.create({
    taskId: task._id,
    userId,
    type: 'TASK_UPDATED',
    details: JSON.stringify(data),
  });

  return task;
};

export const moveTask = async (taskId, newListId, newPosition, userId) => {
  const task = await Task.findByIdAndUpdate(
    taskId,
    { listId: newListId, position: newPosition },
    { new: true }
  );

  await ActivityLog.create({
    taskId: task._id,
    userId,
    type: 'TASK_MOVED',
    details: `Moved to list ${newListId} at position ${newPosition}`,
  });

  return task;
};

export const deleteTask = async (taskId) => {
  return await Task.findByIdAndDelete(taskId);
};

export const getTaskDependencies = async (taskId) => {
  const task = await Task.findById(taskId).populate('dependencies', 'title status health dueDate');
  return task?.dependencies || [];
};

export const addDependency = async (taskId, dependencyId) => {
  if (taskId === dependencyId) {
    throw { statusCode: 400, message: 'A task cannot depend on itself' };
  }
  return await Task.findByIdAndUpdate(
    taskId,
    { $addToSet: { dependencies: dependencyId } },
    { new: true }
  );
};

export const removeDependency = async (taskId, dependencyId) => {
  return await Task.findByIdAndUpdate(
    taskId,
    { $pull: { dependencies: dependencyId } },
    { new: true }
  );
};

// Task Health check — called by a periodic job or on demand
export const evaluateTaskHealth = async (taskId) => {
  const task = await Task.findById(taskId);
  if (!task) return null;

  let health = 'HEALTHY';
  const now = new Date();

  // Check inactivity (no update for 5+ days)
  const daysSinceUpdate = (now - task.updatedAt) / (1000 * 60 * 60 * 24);
  if (daysSinceUpdate > 5) health = 'WARNING';

  // Check deadline proximity
  if (task.dueDate) {
    const daysUntilDue = (task.dueDate - now) / (1000 * 60 * 60 * 24);
    if (daysUntilDue <= 2 && task.status !== 'COMPLETED') health = 'AT_RISK';
    if (daysUntilDue < 0 && task.status !== 'COMPLETED') health = 'AT_RISK';
  }

  // Check incomplete dependencies
  if (task.dependencies && task.dependencies.length > 0) {
    const deps = await Task.find({ _id: { $in: task.dependencies } });
    const incomplete = deps.some((d) => d.status !== 'COMPLETED');
    if (incomplete && health !== 'AT_RISK') health = 'WARNING';
  }

  if (task.health !== health) {
    task.health = health;
    await task.save();
  }

  return health;
};
