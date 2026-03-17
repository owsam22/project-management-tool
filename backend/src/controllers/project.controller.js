import * as projectService from '../services/project.service.js';

export const create = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) throw { statusCode: 400, message: 'Project name is required' };
    const project = await projectService.createProject(name, description || '', req.user.userId);
    res.status(201).json({ status: 'success', data: project });
  } catch (error) {
    next(error);
  }
};

export const list = async (req, res, next) => {
  try {
    const projects = await projectService.getUserProjects(req.user.userId);
    res.status(200).json({ status: 'success', data: projects });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const data = await projectService.getProjectById(req.params.projectId, req.user.userId);
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};

export const invite = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    if (!email) throw { statusCode: 400, message: 'Email is required' };
    const notification = await projectService.inviteMember(req.params.projectId, req.user.userId, email, role || 'MEMBER');
    
    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${notification.userId}`).emit('notification_received', notification);
    }

    res.status(201).json({ status: 'success', data: notification });
  } catch (error) {
    next(error);
  }
};

export const leave = async (req, res, next) => {
  try {
    await projectService.leaveProject(req.params.projectId, req.user.userId);
    res.status(200).json({ status: 'success', message: 'Left the project' });
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const notification = await projectService.removeMember(req.params.projectId, req.user.userId, userId);
    
    // Real-time notification for the removed user
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${notification.userId}`).emit('notification_received', notification);
    }
    
    res.status(200).json({ status: 'success', message: 'Member removed' });
  } catch (error) {
    next(error);
  }
};
