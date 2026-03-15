import { ChatMessage } from '../models/chatMessage.model.js';

export const sendMessage = async (req, res) => {
  try {
    const { projectId, message } = req.body;
    const newMessage = await ChatMessage.create({
      projectId,
      userId: req.user._id,
      message,
    });
    
    const populatedMessage = await ChatMessage.findById(newMessage._id).populate('userId', 'name email');

    // Emit to socket
    const io = req.app.get('io');
    io.to(`project_${projectId}`).emit('chat_message', populatedMessage);

    res.status(201).json({ success: true, data: populatedMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProjectMessages = async (req, res) => {
  try {
    const { projectId } = req.params;
    const messages = await ChatMessage.find({ projectId })
      .populate('userId', 'name email')
      .sort({ createdAt: 1 });
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
