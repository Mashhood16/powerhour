import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import authRoutes from './routes/auth';
import tutorRoutes from './routes/tutor';
import { initializeRealtime } from './realtime/socket';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tutors', tutorRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'PowerHour API is running' });
});

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io Real-time Infrastructure
initializeRealtime(server);

server.listen(PORT, () => {
  console.log(`[Server] Listening on port ${PORT}`);
});
