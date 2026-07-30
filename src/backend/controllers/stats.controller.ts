import { Request, Response } from 'express';
import { db } from '../database/db.js';

export async function getStats(req: Request, res: Response) {
  try {
    const stats = db.getDashboardStats();
    return res.json(stats);
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard stats', message: error.message });
  }
}
