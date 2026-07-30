import { randomUUID } from 'crypto';
const uuidv4 = randomUUID;
import { db } from '../database/db.js';
import { CreateLogDTO, HttpLog } from '../types.js';
import { broadcastHttpLog } from '../websocket/socket.js';
import { alertService } from './alert.service.js';

class LogService {
  public createLog(applicationId: string, dto: CreateLogDTO): HttpLog {
    const app = db.getApplicationById(applicationId);
    if (!app) {
      throw new Error(`Application with ID ${applicationId} not found`);
    }

    const now = new Date().toISOString();

    // Parse host & path from url if missing
    let host = dto.host || '';
    let path = dto.path || '';
    try {
      if (dto.url && (!host || !path)) {
        const parsed = new URL(dto.url.startsWith('http') ? dto.url : `http://${dto.url}`);
        if (!host) host = parsed.host;
        if (!path) path = parsed.pathname;
      }
    } catch (e) {
      if (!host) host = 'localhost';
      if (!path) path = dto.url;
    }

    const dns = dto.dns_time || 0;
    const ssl = dto.ssl_time || 0;
    const conn = dto.connect_time || 0;
    const dur = dto.duration || dto.total_time || 0;
    const total = dto.total_time || (dur + dns + ssl + conn);

    const log: HttpLog = {
      uuid: uuidv4(),
      application_id: app.id,
      application_name: app.name,
      application_color: app.color,
      created_at: now,
      method: dto.method,
      url: dto.url,
      host: host || 'localhost',
      path: path || dto.url,
      query: dto.query || {},
      headers: dto.headers || {},
      request_body: dto.request_body ?? null,
      response_body: dto.response_body ?? null,
      status: dto.status,
      duration: dur,
      dns_time: dns,
      ssl_time: ssl,
      connect_time: conn,
      total_time: total,
      memory_usage: dto.memory_usage || 0,
      peak_memory: dto.peak_memory || 0,
      remote_ip: dto.remote_ip || '127.0.0.1',
      user_agent: dto.user_agent || 'PHP/8.3 HTTP Monitor Client',
      origin: dto.origin || 'WEB',
      usuario_logado: dto.usuario_logado || null,
      request_id: dto.request_id || `req_${uuidv4().substring(0, 12)}`,
      session_id: dto.session_id || `sess_${uuidv4().substring(0, 10)}`,
      trace_id: dto.trace_id || `trace_${uuidv4().substring(0, 16)}`,
      exception: dto.exception || null,
      stack_trace: dto.stack_trace || null,
      tags: dto.tags || [],
      cookies: dto.cookies || {},
      response_headers: dto.response_headers || {},
    };

    // Save to database
    db.addLog(log);

    // Broadcast realtime event over Socket.IO
    broadcastHttpLog(log);

    // Evaluate alert rules asynchronously
    alertService.evaluateNewLog(log);

    return log;
  }
}

export const logService = new LogService();
