import { Task } from '../models/task.model.js';
import { Comment } from '../models/comment.model.js';
import { ActivityLog } from '../models/activityLog.model.js';
import { ProjectMember } from '../models/projectMember.model.js';
import { Board } from '../models/board.model.js';
import { List } from '../models/list.model.js';

// Workload: tasks per user in a project
export const getWorkloadByProject = async (projectId) => {
  const boards = await Board.find({ projectId });
  const boardIds = boards.map((b) => b._id);
  const lists = await List.find({ boardId: { $in: boardIds } });
  const listIds = lists.map((l) => l._id);

  const tasks = await Task.find({ listId: { $in: listIds } }).populate('assignees', 'name email');

  const workload = {};
  tasks.forEach((task) => {
    task.assignees.forEach((user) => {
      const uid = user._id.toString();
      if (!workload[uid]) {
        workload[uid] = { user: { id: uid, name: user.name, email: user.email }, total: 0, completed: 0, inProgress: 0 };
      }
      workload[uid].total++;
      if (task.status === 'COMPLETED') workload[uid].completed++;
      if (task.status === 'IN_PROGRESS') workload[uid].inProgress++;
    });
  });

  return Object.values(workload);
};

// Silent member detection
export const getSilentMembers = async (projectId, dayThreshold = 7) => {
  const members = await ProjectMember.find({ projectId }).populate('userId', 'name email');
  const cutoff = new Date(Date.now() - dayThreshold * 24 * 60 * 60 * 1000);

  const results = [];
  for (const member of members) {
    const userId = member.userId._id;

    const recentActivity = await ActivityLog.countDocuments({
      userId,
      projectId,
      createdAt: { $gte: cutoff },
    });

    const recentComments = await Comment.countDocuments({
      userId,
      createdAt: { $gte: cutoff },
    });

    const totalActivity = recentActivity + recentComments;

    results.push({
      user: { id: userId, name: member.userId.name, email: member.userId.email },
      role: member.role,
      activityCount: totalActivity,
      status: totalActivity === 0 ? 'INACTIVE' : totalActivity <= 2 ? 'LOW' : 'ACTIVE',
    });
  }

  return results;
};

// Task health overview for a project
export const getProjectHealth = async (projectId) => {
  const boards = await Board.find({ projectId });
  const boardIds = boards.map((b) => b._id);
  const lists = await List.find({ boardId: { $in: boardIds } });
  const listIds = lists.map((l) => l._id);

  const tasks = await Task.find({ listId: { $in: listIds } });

  const health = { HEALTHY: 0, WARNING: 0, AT_RISK: 0 };
  const statusCount = { TODO: 0, IN_PROGRESS: 0, REVIEW: 0, COMPLETED: 0 };

  tasks.forEach((t) => {
    health[t.health] = (health[t.health] || 0) + 1;
    statusCount[t.status] = (statusCount[t.status] || 0) + 1;
  });

  return {
    totalTasks: tasks.length,
    health,
    statusBreakdown: statusCount,
    completionRate: tasks.length > 0 ? Math.round((statusCount.COMPLETED / tasks.length) * 100) : 0,
  };
};
