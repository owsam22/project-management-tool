import mongoose from 'mongoose';

const boardSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    position: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Board = mongoose.model('Board', boardSchema);
