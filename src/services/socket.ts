import { io, Socket } from 'socket.io-client';
import { HttpLog, TriggeredAlert } from '../types';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('⚡ Socket.IO Connected successfully:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('⚡ Socket.IO Disconnected');
    });
  }
  return socket;
}

export function subscribeToLogs(callback: (log: HttpLog) => void): () => void {
  const s = getSocket();
  s.on('http_log', callback);
  return () => {
    s.off('http_log', callback);
  };
}

export function subscribeToAlerts(callback: (alert: TriggeredAlert) => void): () => void {
  const s = getSocket();
  s.on('alert_triggered', callback);
  return () => {
    s.off('alert_triggered', callback);
  };
}
