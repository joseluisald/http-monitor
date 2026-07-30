import express from 'express';
import http from 'http';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import { createServer as createViteServer } from 'vite';
import apiRouter from './src/backend/routes/api.js';
import { seedInitialData } from './src/backend/utils/seed.js';
import { initSocketIO } from './src/backend/websocket/socket.js';

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);
  const PORT = 3000;

  // Initialize DB app defaults if empty
  seedInitialData();

  // Initialize Socket.IO
  initSocketIO(httpServer);

  // Security & Middleware
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allowed for Vite dev & iframe
      crossOriginEmbedderPolicy: false,
    })
  );
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Mount API Router
  app.use('/api', apiRouter);

  // Vite Middleware for Development / Static serving for Production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 HTTP Monitor Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting HTTP Monitor server:', err);
});
