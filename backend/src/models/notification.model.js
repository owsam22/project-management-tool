import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'TASK_ASSIGNED',
        'TASK_UPDATED',
        'COMMENT_MENTION',
        'PROJECT_INVITE',
        'DEADLINE_REMINDER',
        'MEMBER_JOINED',
        'MEMBER_REMOVED',
        'TEAM_UPDATE',
      ],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
    },
    read: {
      type: Boolean,
      default: false,
    },
    // For actionable notifications (e.g. invite accept/decline)
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'DECLINED', null],
      default: null,
    },
    actionData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true }
);

export const Notification = mongoose.model('Notification', notificationSchema);
