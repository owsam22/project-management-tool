export default function initSockets(io) {
  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Join a project room for real-time updates
    socket.on('join_project', (projectId) => {
      socket.join(`project_${projectId}`);
      console.log(`[Socket] ${socket.id} joined project_${projectId}`);
    });

    socket.on('error', (error) => {
      console.error(`[Socket] Error for ${socket.id}:`, error);
    });

    // Leave a project room
    socket.on('leave_project', (projectId) => {
      socket.leave(`project_${projectId}`);
      console.log(`[Socket] ${socket.id} left project_${projectId}`);
    });

    // Join a task discussion room
    socket.on('join_task', (taskId) => {
      socket.join(`task_${taskId}`);
    });

    socket.on('leave_task', (taskId) => {
      socket.leave(`task_${taskId}`);
    });

    // Real-time task drag
    socket.on('task_moved', (data) => {
      socket.to(`project_${data.projectId}`).emit('task_moved', data);
    });

    // Real-time comment
    socket.on('new_comment', (data) => {
      socket.to(`task_${data.taskId}`).emit('comment_added', data);
    });

    // Real-time notification
    socket.on('send_notification', (data) => {
      io.to(`user_${data.userId}`).emit('notification_received', data);
    });

    // User presence
    socket.on('user_online', (userId) => {
      socket.join(`user_${userId}`);
      socket.userId = userId;
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });
}
