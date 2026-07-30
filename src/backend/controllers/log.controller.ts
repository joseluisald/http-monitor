import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { CreateHttpLogSchema } from '../validators/schemas.js';
import { logService } from '../services/log.service.js';
import { db } from '../database/db.js';
import { LogFilterParams } from '../types.js';

export async function ingestHttpLog(req: AuthenticatedRequest, res: Response) {
  try {
    const parseResult = CreateHttpLogSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation Error',
        details: parseResult.error.format(),
      });
    }

    const application = req.application!;
    const log = logService.createLog(application.id, parseResult.data);

    return res.status(201).json({
      success: true,
      id: log.uuid,
      created_at: log.created_at,
    });
  } catch (error: any) {
    console.error('Error ingesting HTTP log:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to ingest log',
    });
  }
}

export async function getLogs(req: AuthenticatedRequest, res: Response) {
  try {
    const {
      application_id,
      method,
      status,
      status_group,
      origin,
      start_date,
      end_date,
      query_text,
      url_path,
      user,
      min_duration,
      max_duration,
      tag,
      page,
      limit,
      sort_by,
      sort_order,
    } = req.query;

    const filterParams: LogFilterParams = {
      application_id: application_id as string,
      method: method as string,
      status: status as string,
      status_group: status_group as any,
      origin: origin as string,
      start_date: start_date as string,
      end_date: end_date as string,
      query_text: query_text as string,
      url_path: url_path as string,
      user: user as string,
      min_duration: min_duration ? parseFloat(min_duration as string) : undefined,
      max_duration: max_duration ? parseFloat(max_duration as string) : undefined,
      tag: tag as string,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 50,
      sort_by: (sort_by as string) || 'created_at',
      sort_order: (sort_order as any) || 'desc',
    };

    const result = db.queryLogs(filterParams);
    return res.json(result);
  } catch (error: any) {
    console.error('Error fetching logs:', error);
    return res.status(500).json({ error: 'Failed to fetch logs', message: error.message });
  }
}

export async function getLogById(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const log = db.getLogById(id);

    if (!log) {
      return res.status(404).json({ error: 'Log not found', message: `No HTTP log found with ID ${id}` });
    }

    return res.json(log);
  } catch (error: any) {
    console.error('Error fetching log by id:', error);
    return res.status(500).json({ error: 'Failed to fetch log', message: error.message });
  }
}
