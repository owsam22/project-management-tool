import * as decisionService from '../services/decision.service.js';

export const getDecisions = async (req, res, next) => {
  try {
    const decisions = await decisionService.getDecisionsByTask(req.params.taskId);
    res.status(200).json({ status: 'success', data: decisions });
  } catch (error) {
    next(error);
  }
};

export const logDecision = async (req, res, next) => {
  try {
    const { problem, options, finalDecision, reason } = req.body;
    if (!problem || !finalDecision) {
      throw { statusCode: 400, message: 'Problem and finalDecision are required' };
    }
    const decision = await decisionService.logDecision(req.params.taskId, req.user.userId, req.body);
    res.status(201).json({ status: 'success', data: decision });
  } catch (error) {
    next(error);
  }
};
