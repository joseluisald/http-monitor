import { Request, Response } from 'express';
import { db } from '../database/db.js';
import { CreateApplicationSchema, UpdateApplicationSchema } from '../validators/schemas.js';

export async function getApplications(req: Request, res: Response) {
  try {
    const apps = db.getApplications();
    return res.json(apps);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch applications', message: error.message });
  }
}

export async function getApplicationById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const app = db.getApplicationById(id);
    if (!app) {
      return res.status(404).json({ error: 'Application not found' });
    }
    return res.json(app);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch application', message: error.message });
  }
}

export async function createApplication(req: Request, res: Response) {
  try {
    const parseResult = CreateApplicationSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Validation Error', details: parseResult.error.format() });
    }

    const app = db.createApplication(parseResult.data);
    return res.status(201).json(app);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to create application', message: error.message });
  }
}

export async function updateApplication(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const parseResult = UpdateApplicationSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Validation Error', details: parseResult.error.format() });
    }

    const updated = db.updateApplication(id, parseResult.data);
    if (!updated) {
      return res.status(404).json({ error: 'Application not found' });
    }

    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update application', message: error.message });
  }
}

export async function deleteApplication(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const deleted = db.deleteApplication(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Application not found' });
    }

    return res.json({ success: true, message: 'Application deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to delete application', message: error.message });
  }
}
