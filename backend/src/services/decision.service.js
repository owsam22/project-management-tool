import { Decision } from '../models/decision.model.js';
import { ActivityLog } from '../models/activityLog.model.js';

export const getDecisionsByTask = async (taskId) => {
  return await Decision.find({ taskId })
    .populate('approvedBy', 'name email')
    .sort({ createdAt: -1 });
};

export const logDecision = async (taskId, userId, data) => {
  const decision = await Decision.create({
    taskId,
    problem: data.problem,
    options: data.options,
    finalDecision: data.finalDecision,
    reason: data.reason,
    approvedBy: userId,
  });

  await ActivityLog.create({
    taskId,
    userId,
    type: 'DECISION_LOGGED',
    details: `Decision: ${data.problem} → ${data.finalDecision}`,
  });

  return await decision.populate('approvedBy', 'name email');
};
