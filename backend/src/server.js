import app from './app.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import initSockets from './sockets/index.js';

dotenv.config();

const port = process.env.PORT || 5000;
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
  },
});

// Store io instance on app for controllers to access
app.set('io', io);

// Initialize socket event handlers
initSockets(io);

// Connect to MongoDB and start server
connectDB().then(() => {
  httpServer.listen(port, () => {
    console.log(`[SCPM] Server running on http://localhost:${port}`);
    console.log(`[SCPM] API docs: http://localhost:${port}/api/health`);
  });
});
