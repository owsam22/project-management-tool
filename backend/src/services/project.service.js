import { Project } from '../models/project.model.js';
import { ProjectMember } from '../models/projectMember.model.js';
import { Board } from '../models/board.model.js';
import { List } from '../models/list.model.js';
import { User } from '../models/user.model.js';

export const createProject = async (name, description, ownerId) => {
  const project = await Project.create({ name, description, ownerId });

  // Auto-add owner as OWNER role member
  await ProjectMember.create({ projectId: project._id, userId: ownerId, role: 'OWNER' });

  // Create a default board with 4 default lists
  const board = await Board.create({ projectId: project._id, name: 'Main Board', position: 0 });

  const defaultLists = ['To Do', 'In Progress', 'Review', 'Completed'];
  await Promise.all(
    defaultLists.map((listName, index) =>
      List.create({ boardId: board._id, name: listName, position: index })
    )
  );

  return project;
};

export const getUserProjects = async (userId) => {
  const memberships = await ProjectMember.find({ userId }).populate('projectId');
  return memberships.map((m) => ({
    project: m.projectId,
    role: m.role,
    joinedAt: m.createdAt,
  }));
};

export const getProjectById = async (projectId, userId) => {
  const membership = await ProjectMember.findOne({ projectId, userId });
  if (!membership) {
    throw { statusCode: 403, message: 'You are not a member of this project' };
  }

  const project = await Project.findById(projectId);
  const members = await ProjectMember.find({ projectId }).populate('userId', 'name email avatarUrl');

  return { project, members, currentUserRole: membership.role };
};

export const inviteMember = async (projectId, inviterId, email, role = 'MEMBER') => {
  const inviter = await ProjectMember.findOne({ projectId, userId: inviterId });
  if (!inviter || !['OWNER', 'ADMIN'].includes(inviter.role)) {
    throw { statusCode: 403, message: 'Insufficient privileges to invite members' };
  }

  const userToInvite = await User.findOne({ email });
  if (!userToInvite) {
    throw { statusCode: 404, message: 'No user found with this email' };
  }

  const existing = await ProjectMember.findOne({ projectId, userId: userToInvite._id });
  if (existing) {
    throw { statusCode: 400, message: 'User is already a member of this project' };
  }

  return await ProjectMember.create({ projectId, userId: userToInvite._id, role });
};

export const leaveProject = async (projectId, userId) => {
  const membership = await ProjectMember.findOne({ projectId, userId });
  if (!membership) {
    throw { statusCode: 404, message: 'You are not a member of this project' };
  }
  if (membership.role === 'OWNER') {
    throw { statusCode: 400, message: 'Owner cannot leave the project. Transfer ownership first.' };
  }
  await ProjectMember.deleteOne({ projectId, userId });
};

export const removeMember = async (projectId, adminId, userIdToRemove) => {
  const adminMembership = await ProjectMember.findOne({ projectId, userId: adminId });
  if (!adminMembership || !['OWNER', 'ADMIN'].includes(adminMembership.role)) {
    throw { statusCode: 403, message: 'Insufficient privileges to remove members' };
  }

  const memberToRemove = await ProjectMember.findOne({ projectId, userId: userIdToRemove });
  if (!memberToRemove) {
    throw { statusCode: 404, message: 'Member not found in this project' };
  }

  if (memberToRemove.role === 'OWNER') {
    throw { statusCode: 400, message: 'Cannot remove the project owner' };
  }

  await ProjectMember.deleteOne({ projectId, userId: userIdToRemove });
};
