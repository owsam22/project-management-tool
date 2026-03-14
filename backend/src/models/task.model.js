import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    listId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'List',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'],
      default: 'TODO',
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
    },
    health: {
      type: String,
      enum: ['HEALTHY', 'WARNING', 'AT_RISK'],
      default: 'HEALTHY',
    },
    dueDate: {
      type: Date,
      default: null,
    },
    position: {
      type: Number,
      default: 0,
    },
    labels: [{
      type: String,
      trim: true,
    }],
    checklist: [{
      text: { type: String, required: true },
      done: { type: Boolean, default: false },
    }],
    assignees: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    dependencies: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
    }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

export const Task = mongoose.model('Task', taskSchema);
