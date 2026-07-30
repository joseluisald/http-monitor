import { Request, Response } from 'express';
import { db } from '../database/db.js';
import { LogFilterParams } from '../types.js';

export async function exportLogsJson(req: Request, res: Response) {
  try {
    const query = req.query as unknown as LogFilterParams;
    const result = db.queryLogs({ ...query, limit: 10000 });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=http_monitor_logs_${Date.now()}.json`);
    return res.send(JSON.stringify(result.data, null, 2));
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to export logs JSON', message: error.message });
  }
}

export async function exportLogsCsv(req: Request, res: Response) {
  try {
    const query = req.query as unknown as LogFilterParams;
    const result = db.queryLogs({ ...query, limit: 10000 });

    const headers = [
      'UUID',
      'Created At',
      'Application',
      'Method',
      'Status',
      'Total Time (ms)',
      'URL',
      'Host',
      'Path',
      'Origin',
      'User',
      'IP',
      'Exception',
    ];

    const rows = result.data.map((l) => [
      l.uuid,
      l.created_at,
      l.application_name || l.application_id,
      l.method,
      l.status,
      l.total_time,
      `"${(l.url || '').replace(/"/g, '""')}"`,
      l.host,
      l.path,
      l.origin,
      `"${(l.usuario_logado || '').replace(/"/g, '""')}"`,
      l.remote_ip,
      `"${(l.exception || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=http_monitor_logs_${Date.now()}.csv`);
    return res.send(csvContent);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to export logs CSV', message: error.message });
  }
}
