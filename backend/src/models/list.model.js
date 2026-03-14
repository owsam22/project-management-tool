import mongoose from 'mongoose';

const listSchema = new mongoose.Schema(
  {
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
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

export const List = mongoose.model('List', listSchema);
