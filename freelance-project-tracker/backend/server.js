import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

// Routes
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import messageRoutes from './routes/messages.js';
import profileRoutes from './routes/profiles.js';
import paymentRoutes from './routes/payments.js';
import walletRoutes from './routes/wallet.js';
import notificationRoutes from './routes/notifications.js';
import adminRoutes from './routes/admin.js';
import debugRoutes from './debug-endpoint.js';

// Services
import { notificationService } from './services/notification.js';

dotenv.config();

const app = express();
const server = createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.WS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.WS_ORIGIN || "http://localhost:3000",
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', debugRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Socket.IO authentication and connection handling
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devsecretchange');
      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
    }
    next();
  } catch (err) {
    // Allow anonymous connections for demo
    next();
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.userId || 'anonymous');
  
  // Join user to their personal room
  if (socket.userId) {
    socket.join(`user:${socket.userId}`);
    
    // Emit user online status
    socket.broadcast.emit('user:online', { userId: socket.userId });
  }
  
  // Handle sending messages
  socket.on('message:send', async (data) => {
    try {
      if (!socket.userId) return;
      
      // Broadcast message to recipient
      socket.to(`user:${data.recipientId}`).emit('message:receive', {
        ...data,
        senderId: socket.userId,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Socket message error:', error);
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.userId || 'anonymous');
    if (socket.userId) {
      socket.broadcast.emit('user:offline', { userId: socket.userId });
    }
  });
});

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/fpt';
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT_BACKEND || 4000;

// Start server
const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer().catch(console.error);

export default app;
