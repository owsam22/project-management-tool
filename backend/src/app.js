import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Route imports
import authRoutes from './routes/auth.routes.js';
import projectRoutes from './routes/project.routes.js';
import boardRoutes from './routes/board.routes.js';
import taskRoutes from './routes/task.routes.js';
import commentRoutes from './routes/comment.routes.js';
import decisionRoutes from './routes/decision.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import nlpRoutes from './routes/nlp.routes.js';

// Middleware imports
import { errorHandler } from './middlewares/errorHandler.js';

dotenv.config();

const app = express();

// Security & parsing
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'SCPM Backend is running' });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/boards', boardRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/comments', commentRoutes);
app.use('/api/v1/decisions', decisionRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/nlp', nlpRoutes);

// Error handler
app.use(errorHandler);

export default app;
