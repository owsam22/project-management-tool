import * as analyticsService from '../services/analytics.service.js';

export const getWorkload = async (req, res, next) => {
  try {
    const data = await analyticsService.getWorkloadByProject(req.params.projectId);
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};

export const getSilentMembers = async (req, res, next) => {
  try {
    const data = await analyticsService.getSilentMembers(req.params.projectId);
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};

export const getProjectHealth = async (req, res, next) => {
  try {
    const data = await analyticsService.getProjectHealth(req.params.projectId);
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};
