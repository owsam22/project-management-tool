import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'TASK_CREATED', 'TASK_UPDATED', 'TASK_MOVED',
        'COMMENT_ADDED', 'MEMBER_JOINED', 'DECISION_LOGGED',
      ],
      required: true,
    },
    details: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
