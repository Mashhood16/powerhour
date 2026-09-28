import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verifyToken } from '../utils/jwt';

export const initializeRealtime = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*', // In production, restrict to frontend URLs
      methods: ['GET', 'POST']
    }
  });

  // Middleware for Socket Authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }
    try {
      const decoded = verifyToken(token);
      socket.data.user = decoded; // Store user payload
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] User connected: ${socket.data.user.userId} (Socket ID: ${socket.id})`);

    /**
     * Join Lesson Room
     * Business Rule: Restrict access to the two booked participants, 
     * opening 10 minutes before and closing 15 minutes after.
     * (Time boundary logic should be enforced here querying the DB)
     */
    socket.on('join-room', (roomId: string) => {
      // Mock validation: In reality, check if socket.data.user.userId is part of the booking
      // and if current time is within (booking.start_time - 10m) and (booking.end_time + 15m).
      
      socket.join(roomId);
      console.log(`[Socket] User ${socket.data.user.userId} joined room ${roomId}`);
      
      // Notify others in the room
      socket.to(roomId).emit('user-joined', socket.data.user.userId);
    });

    /**
     * WebRTC Signaling: Offer, Answer, ICE Candidates
     */
    socket.on('webrtc-offer', ({ roomId, offer }) => {
      socket.to(roomId).emit('webrtc-offer', { senderId: socket.data.user.userId, offer });
    });

    socket.on('webrtc-answer', ({ roomId, answer }) => {
      socket.to(roomId).emit('webrtc-answer', { senderId: socket.data.user.userId, answer });
    });

    socket.on('webrtc-ice-candidate', ({ roomId, candidate }) => {
      socket.to(roomId).emit('webrtc-ice-candidate', { senderId: socket.data.user.userId, candidate });
    });

    /**
     * Real-time Text Chat (Encrypted payload expected from client)
     */
    socket.on('chat-message', ({ roomId, encryptedPayload }) => {
      // Broadcast chat message to the room
      socket.to(roomId).emit('chat-message', {
        senderId: socket.data.user.userId,
        encryptedPayload,
        timestamp: new Date()
      });
    });

    /**
     * Synchronized Digital Whiteboard
     */
    socket.on('whiteboard-draw', ({ roomId, drawingData }) => {
      socket.to(roomId).emit('whiteboard-draw', drawingData);
    });

    /**
     * Document Sharing Events
     */
    socket.on('document-share', ({ roomId, documentUrl }) => {
      socket.to(roomId).emit('document-share', { senderId: socket.data.user.userId, documentUrl });
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${socket.data.user.userId}`);
      // Clean up or emit user-left events if necessary
    });
  });

  return io;
};
