import { Server } from 'socket.io';
import { createServer } from 'http';
import { parse } from 'url';
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

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-room', (roomId: string, userId: string, userColor: string) => {
      socket.join(roomId);
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }
      rooms.get(roomId)?.add(userId);

      // Notify others in the room
      socket.to(roomId).emit('user-joined', {
        users: Array.from(rooms.get(roomId) || []),
        user: { id: userId, color: userColor }
      });
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

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      // Clean up rooms
      rooms.forEach((users, roomId) => {
        users.delete(socket.id);
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