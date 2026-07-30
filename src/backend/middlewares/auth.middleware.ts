import { Request, Response, NextFunction } from 'express';
import { db } from '../database/db.js';
import { Application } from '../types.js';

export interface AuthenticatedRequest extends Request {
  application?: Application;
}

export function authenticateBearerToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or invalid Authorization header. Expected format: Bearer <TOKEN>',
    });
  }

  const token = authHeader.split(' ')[1].trim();
  const app = db.getApplicationByToken(token);

  if (!app) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid application token provided.',
    });
  }

  if (!app.active) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'This application is marked as inactive.',
    });
  }

  req.application = app;
  next();
}
