import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({ origin: corsOrigin }));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: corsOrigin, methods: ['GET', 'POST'] },
  maxHttpBufferSize: 100_000,
});

const ROOM_CODE_PATTERN = /^[A-Z0-9-]{3,24}$/;
const ALLOWED_MESSAGES = new Set([
  'presence', 'leave', 'start', 'state', 'move', 'skill',
  'restartRequest', 'restart',
]);

function getRoomCode(value) {
  if (typeof value !== 'string') return null;
  const roomCode = value.trim().toUpperCase();
  return ROOM_CODE_PATTERN.test(roomCode) ? roomCode : null;
}

io.on('connection', (socket) => {
  socket.on('joinRoom', ({ roomCode: requestedRoom } = {}) => {
    const roomCode = getRoomCode(requestedRoom);
    if (!roomCode) {
      socket.emit('roomError', { message: 'Invalid room code.' });
      return;
    }

    if (socket.data.roomCode && socket.data.roomCode !== roomCode) {
      socket.leave(socket.data.roomCode);
    }
    socket.data.roomCode = roomCode;
    socket.join(roomCode);
    socket.emit('roomJoined', { roomCode });
  });

  socket.on('roomMessage', ({ roomCode: requestedRoom, message } = {}) => {
    const roomCode = getRoomCode(requestedRoom);
    if (!roomCode || roomCode !== socket.data.roomCode) {
      socket.emit('roomError', { message: 'Join this room before sending messages.' });
      return;
    }
    if (!message || !ALLOWED_MESSAGES.has(message.type) || typeof message.senderId !== 'string') {
      socket.emit('roomError', { message: 'Invalid room message.' });
      return;
    }
    socket.to(roomCode).emit('roomMessage', message);
  });

  socket.on('disconnect', () => {
    socket.data.roomCode = null;
  });
});

app.get('/', (_request, response) => {
  response.json({
    name: 'Monad Pantheon Socket.io room relay',
    status: 'running',
    rooms: io.sockets.adapter.rooms.size,
    players: io.engine.clientsCount,
  });
});

const port = Number(process.env.PORT || 3001);
httpServer.listen(port, () => {
  console.log(`Monad Pantheon Socket.io room relay listening on port ${port}`);
});
