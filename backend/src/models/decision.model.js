import mongoose from 'mongoose';

const decisionSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },
    problem: {
      type: String,
      required: true,
    },
    options: {
      type: String,
      required: true,
    },
    finalDecision: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

export const Decision = mongoose.model('Decision', decisionSchema);
