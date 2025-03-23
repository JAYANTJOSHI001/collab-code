import { createServer } from 'http';
import { parse } from 'url';
import { Server } from 'socket.io';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  });

  // Store active rooms and their users
  const rooms = new Map<string, Set<string>>();
  // Store user information including socket ID mapping
  const userInfo = new Map<string, { socketId: string, userId: string, color: string }>();

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-room', (roomId: string, userId: string, userColor: string) => {
      socket.join(roomId);
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }
      rooms.get(roomId)?.add(userId);
      
      // Store user info for WebRTC signaling
      userInfo.set(socket.id, { socketId: socket.id, userId, color: userColor });

      // Notify others in the room
      socket.to(roomId).emit('user-joined', {
        users: Array.from(rooms.get(roomId) || []),
        user: { id: userId, color: userColor }
      });
      
      // Send current users to the new user
      const roomUsers = Array.from(rooms.get(roomId) || [])
        .filter(id => id !== userId)
        .map(id => {
          // Find socket ID for this user
          const userSocket = Array.from(userInfo.entries())
            .find(([socketId, info]) => {
              console.log(socketId);
              return info.userId === id; // Added return statement here
            }
          );
            
          return userSocket ? { id, socketId: userSocket[0] } : { id };
        });
      
      socket.emit('current-users', roomUsers);
    });

    socket.on('code-change', ({ file, content }) => {
      const roomId = Array.from(socket.rooms)[1]; // First room is socket.id
      if (roomId) {
        socket.to(roomId).emit('code-update', { file, content });
      }
    });

    socket.on('cursor-move', ({ userId, position, color }) => {
      const roomId = Array.from(socket.rooms)[1];
      if (roomId) {
        socket.to(roomId).emit('cursor-update', { userId, position, color });
      }
    });

    // WebRTC Signaling
    socket.on('webrtc-offer', ({ target, offer, from }) => {
      console.log(`Relaying WebRTC offer from ${from} to ${target}`);
      socket.to(target).emit('webrtc-offer', { offer, from: socket.id });
    });

    socket.on('webrtc-answer', ({ target, answer, from }) => {
      console.log(`Relaying WebRTC answer from ${from} to ${target}`);
      socket.to(target).emit('webrtc-answer', { answer, from: socket.id });
    });

    socket.on('webrtc-ice-candidate', ({ target, candidate, from }) => {
      console.log(`Relaying ICE candidate from ${from} to ${target}`);
      socket.to(target).emit('webrtc-ice-candidate', { candidate, from: socket.id });
    });

    socket.on('webrtc-speaking', ({ roomId, userId, speaking }) => {
      // Relay speaking status to all users in the room
      socket.to(roomId).emit('user-speaking', { userId, speaking });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      // Get user info before removing
      const user = userInfo.get(socket.id);
      userInfo.delete(socket.id);
      
      // Clean up rooms
      rooms.forEach((users, roomId) => {
        if (user) {
          users.delete(user.userId);
          // Notify others that user has left
          socket.to(roomId).emit('user-left', {
            users: Array.from(users),
            userId: user.userId
          });
        }
        
        if (users.size === 0) {
          rooms.delete(roomId);
        }
      });
    });
  });

  const port = parseInt(process.env.PORT || '4000', 10);
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});