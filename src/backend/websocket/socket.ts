import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { HttpLog, TriggeredAlert } from '../types.js';

let ioServer: SocketIOServer | null = null;

export function initSocketIO(server: HttpServer): SocketIOServer {
  ioServer = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  ioServer.on('connection', (socket: Socket) => {
    console.log(`🔌 Client connected to WebSocket: ${socket.id}`);

    socket.emit('connected', {
      message: 'Connected to HTTP Monitor WebSocket Server',
      timestamp: new Date().toISOString(),
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected from WebSocket: ${socket.id}`);
    });
  });

  return ioServer;
}

export function broadcastHttpLog(log: HttpLog) {
  if (ioServer) {
    ioServer.emit('http_log', log);
  }
}

export function broadcastAlert(alert: TriggeredAlert) {
  if (ioServer) {
    ioServer.emit('alert_triggered', alert);
  }
}

export function getIO(): SocketIOServer | null {
  return ioServer;
}
