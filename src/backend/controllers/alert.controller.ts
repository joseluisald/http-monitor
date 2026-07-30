import { Request, Response } from 'express';
import { db } from '../database/db.js';
import { CreateAlertRuleSchema } from '../validators/schemas.js';

export async function getAlertRules(req: Request, res: Response) {
  try {
    const rules = db.getAlertRules();
    return res.json(rules);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch alert rules', message: error.message });
  }
}

export async function createAlertRule(req: Request, res: Response) {
  try {
    const parseResult = CreateAlertRuleSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Validation Error', details: parseResult.error.format() });
    }

    const rule = db.createAlertRule({
      name: parseResult.data.name,
      type: parseResult.data.type,
      application_id: parseResult.data.application_id || undefined,
      threshold_value: parseResult.data.threshold_value,
      time_window_seconds: parseResult.data.time_window_seconds,
      enabled: parseResult.data.enabled,
    });

    return res.status(201).json(rule);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to create alert rule', message: error.message });
  }
}

export async function getTriggeredAlerts(req: Request, res: Response) {
  try {
    const alerts = db.getTriggeredAlerts();
    return res.json(alerts);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch triggered alerts', message: error.message });
  }
}

export async function resolveAlert(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const resolved = db.resolveAlert(id);
    if (!resolved) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    return res.json({ success: true, message: 'Alert resolved' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to resolve alert', message: error.message });
  }
}
