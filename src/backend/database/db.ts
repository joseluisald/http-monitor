import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import Database from 'better-sqlite3';
import { Application, HttpLog, AlertRule, TriggeredAlert, LogFilterParams, DashboardStats } from '../types.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.sqlite');
const OLD_JSON_FILE = path.join(DATA_DIR, 'db.json');

class SqliteDatabase {
  private db: Database.Database;

  constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    this.db = new Database(DB_FILE);
    this.db.pragma('journal_mode = WAL');

    this.initTables();
    this.migrateFromJson();
  }

  private initTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS applications (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        environment TEXT,
        color TEXT,
        active INTEGER DEFAULT 1,
        created_at TEXT,
        updated_at TEXT,
        last_seen_at TEXT,
        total_requests_today INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS logs (
        uuid TEXT PRIMARY KEY,
        application_id TEXT,
        application_name TEXT,
        application_color TEXT,
        created_at TEXT,
        method TEXT,
        url TEXT,
        host TEXT,
        path TEXT,
        query TEXT,
        headers TEXT,
        request_body TEXT,
        response_body TEXT,
        status INTEGER,
        duration REAL,
        dns_time REAL,
        ssl_time REAL,
        connect_time REAL,
        total_time REAL,
        memory_usage REAL,
        peak_memory REAL,
        remote_ip TEXT,
        user_agent TEXT,
        origin TEXT,
        usuario_logado TEXT,
        request_id TEXT,
        session_id TEXT,
        trace_id TEXT,
        exception TEXT,
        stack_trace TEXT,
        tags TEXT,
        cookies TEXT,
        response_headers TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at);
      CREATE INDEX IF NOT EXISTS idx_logs_app_id ON logs(application_id);
      CREATE INDEX IF NOT EXISTS idx_logs_status ON logs(status);

      CREATE TABLE IF NOT EXISTS alert_rules (
        id TEXT PRIMARY KEY,
        name TEXT,
        type TEXT,
        application_id TEXT,
        threshold_value REAL,
        time_window_seconds INTEGER,
        enabled INTEGER DEFAULT 1,
        created_at TEXT
      );

      CREATE TABLE IF NOT EXISTS triggered_alerts (
        id TEXT PRIMARY KEY,
        rule_id TEXT,
        rule_name TEXT,
        application_id TEXT,
        application_name TEXT,
        message TEXT,
        severity TEXT DEFAULT 'warning',
        triggered_at TEXT,
        resolved INTEGER DEFAULT 0,
        metadata TEXT
      );

      CREATE TABLE IF NOT EXISTS saved_filters (
        id TEXT PRIMARY KEY,
        name TEXT,
        filter TEXT,
        created_at TEXT
      );
    `);
  }

  private migrateFromJson() {
    try {
      if (fs.existsSync(OLD_JSON_FILE)) {
        const raw = fs.readFileSync(OLD_JSON_FILE, 'utf-8');
        const oldStore = JSON.parse(raw);

        if (oldStore.applications && Array.isArray(oldStore.applications)) {
          const stmtApp = this.db.prepare(`
            INSERT OR IGNORE INTO applications (id, name, token, environment, color, active, created_at, updated_at, last_seen_at, total_requests_today)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          for (const app of oldStore.applications) {
            stmtApp.run(
              app.id,
              app.name,
              app.token,
              app.environment || 'production',
              app.color || '#3b82f6',
              app.active ? 1 : 0,
              app.created_at,
              app.updated_at,
              app.last_seen_at || app.created_at,
              app.total_requests_today || 0
            );
          }
        }

        if (oldStore.logs && Array.isArray(oldStore.logs)) {
          const stmtLog = this.db.prepare(`
            INSERT OR IGNORE INTO logs (
              uuid, application_id, application_name, application_color, created_at, method, url, host, path,
              query, headers, request_body, response_body, status, duration, dns_time, ssl_time, connect_time,
              total_time, memory_usage, peak_memory, remote_ip, user_agent, origin, usuario_logado,
              request_id, session_id, trace_id, exception, stack_trace, tags, cookies, response_headers
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          for (const l of oldStore.logs) {
            stmtLog.run(
              l.uuid,
              l.application_id,
              l.application_name || null,
              l.application_color || null,
              l.created_at,
              l.method,
              l.url,
              l.host || '',
              l.path || '',
              typeof l.query === 'object' ? JSON.stringify(l.query) : l.query || '',
              typeof l.headers === 'object' ? JSON.stringify(l.headers) : l.headers || '',
              typeof l.request_body === 'object' ? JSON.stringify(l.request_body) : l.request_body || '',
              typeof l.response_body === 'object' ? JSON.stringify(l.response_body) : l.response_body || '',
              l.status,
              l.duration || 0,
              l.dns_time || 0,
              l.ssl_time || 0,
              l.connect_time || 0,
              l.total_time || l.duration || 0,
              l.memory_usage || 0,
              l.peak_memory || 0,
              l.remote_ip || '',
              l.user_agent || '',
              l.origin || 'WEB',
              l.usuario_logado || null,
              l.request_id || '',
              l.session_id || '',
              l.trace_id || '',
              l.exception || null,
              l.stack_trace || null,
              Array.isArray(l.tags) ? JSON.stringify(l.tags) : '[]',
              typeof l.cookies === 'object' ? JSON.stringify(l.cookies) : '',
              typeof l.response_headers === 'object' ? JSON.stringify(l.response_headers) : ''
            );
          }
        }

        if (oldStore.alert_rules && Array.isArray(oldStore.alert_rules)) {
          const stmtRule = this.db.prepare(`
            INSERT OR IGNORE INTO alert_rules (id, name, type, application_id, threshold_value, time_window_seconds, enabled, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `);
          for (const r of oldStore.alert_rules) {
            stmtRule.run(
              r.id,
              r.name,
              r.type,
              r.application_id || null,
              r.threshold_value,
              r.time_window_seconds,
              r.enabled ? 1 : 0,
              r.created_at
            );
          }
        }

        fs.unlinkSync(OLD_JSON_FILE);
      }
    } catch (err) {
      console.error('Error migrating from db.json to SQLite:', err);
    }
  }

  // --- Applications ---
  public getApplications(): Application[] {
    const rows = this.db.prepare(`SELECT * FROM applications ORDER BY created_at ASC`).all() as any[];
    return rows.map(this.mapAppRow);
  }

  public getApplicationById(id: string): Application | undefined {
    const row = this.db.prepare(`SELECT * FROM applications WHERE id = ?`).get(id) as any;
    return row ? this.mapAppRow(row) : undefined;
  }

  public getApplicationByToken(token: string): Application | undefined {
    const row = this.db.prepare(`SELECT * FROM applications WHERE token = ?`).get(token) as any;
    return row ? this.mapAppRow(row) : undefined;
  }

  public createApplication(data: { name: string; environment?: string; color?: string; token?: string }): Application {
    const now = new Date().toISOString();
    const app: Application = {
      id: `app_${randomUUID().substring(0, 8)}`,
      name: data.name,
      token: data.token || `tok_${randomUUID().replace(/-/g, '')}`,
      environment: data.environment || 'production',
      color: data.color || '#3b82f6',
      active: true,
      created_at: now,
      updated_at: now,
      last_seen_at: now,
      total_requests_today: 0,
    };

    this.db.prepare(`
      INSERT INTO applications (id, name, token, environment, color, active, created_at, updated_at, last_seen_at, total_requests_today)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      app.id,
      app.name,
      app.token,
      app.environment,
      app.color,
      1,
      app.created_at,
      app.updated_at,
      app.last_seen_at,
      0
    );

    return app;
  }

  public updateApplication(id: string, updates: Partial<Application>): Application | null {
    const app = this.getApplicationById(id);
    if (!app) return null;

    const updated: Application = {
      ...app,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    this.db.prepare(`
      UPDATE applications
      SET name = ?, environment = ?, color = ?, active = ?, updated_at = ?, last_seen_at = ?, total_requests_today = ?
      WHERE id = ?
    `).run(
      updated.name,
      updated.environment,
      updated.color,
      updated.active ? 1 : 0,
      updated.updated_at,
      updated.last_seen_at,
      updated.total_requests_today || 0,
      id
    );

    return updated;
  }

  public deleteApplication(id: string): boolean {
    const result = this.db.prepare(`DELETE FROM applications WHERE id = ?`).run(id);
    return result.changes > 0;
  }

  public touchApplication(id: string) {
    const now = new Date().toISOString();
    this.db.prepare(`
      UPDATE applications
      SET last_seen_at = ?, total_requests_today = total_requests_today + 1
      WHERE id = ?
    `).run(now, id);
  }

  private mapAppRow(row: any): Application {
    return {
      id: row.id,
      name: row.name,
      token: row.token,
      environment: row.environment,
      color: row.color,
      active: Boolean(row.active),
      created_at: row.created_at,
      updated_at: row.updated_at,
      last_seen_at: row.last_seen_at,
      total_requests_today: row.total_requests_today,
    };
  }

  // --- Logs ---
  public addLog(log: HttpLog): HttpLog {
    const stmt = this.db.prepare(`
      INSERT INTO logs (
        uuid, application_id, application_name, application_color, created_at, method, url, host, path,
        query, headers, request_body, response_body, status, duration, dns_time, ssl_time, connect_time,
        total_time, memory_usage, peak_memory, remote_ip, user_agent, origin, usuario_logado,
        request_id, session_id, trace_id, exception, stack_trace, tags, cookies, response_headers
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      log.uuid,
      log.application_id,
      log.application_name || null,
      log.application_color || null,
      log.created_at,
      log.method,
      log.url,
      log.host || '',
      log.path || '',
      typeof log.query === 'object' ? JSON.stringify(log.query) : log.query || '',
      typeof log.headers === 'object' ? JSON.stringify(log.headers) : log.headers || '',
      typeof log.request_body === 'object' ? JSON.stringify(log.request_body) : log.request_body || '',
      typeof log.response_body === 'object' ? JSON.stringify(log.response_body) : log.response_body || '',
      log.status,
      log.duration || 0,
      log.dns_time || 0,
      log.ssl_time || 0,
      log.connect_time || 0,
      log.total_time || log.duration || 0,
      log.memory_usage || 0,
      log.peak_memory || 0,
      log.remote_ip || '',
      log.user_agent || '',
      log.origin || 'WEB',
      log.usuario_logado || null,
      log.request_id || '',
      log.session_id || '',
      log.trace_id || '',
      log.exception || null,
      log.stack_trace || null,
      Array.isArray(log.tags) ? JSON.stringify(log.tags) : '[]',
      typeof log.cookies === 'object' ? JSON.stringify(log.cookies) : '',
      typeof log.response_headers === 'object' ? JSON.stringify(log.response_headers) : ''
    );

    this.touchApplication(log.application_id);
    return log;
  }

  public getLogById(uuid: string): HttpLog | undefined {
    const row = this.db.prepare(`SELECT * FROM logs WHERE uuid = ?`).get(uuid) as any;
    return row ? this.mapLogRow(row) : undefined;
  }

  public queryLogs(params: LogFilterParams) {
    const conditions: string[] = [];
    const sqlParams: any[] = [];

    if (params.application_id) {
      conditions.push(`application_id = ?`);
      sqlParams.push(params.application_id);
    }

    if (params.method) {
      const methods = params.method.split(',').map((m) => m.trim().toUpperCase());
      const placeholders = methods.map(() => '?').join(',');
      conditions.push(`method IN (${placeholders})`);
      sqlParams.push(...methods);
    }

    if (params.status) {
      const statuses = params.status.split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
      if (statuses.length > 0) {
        const placeholders = statuses.map(() => '?').join(',');
        conditions.push(`status IN (${placeholders})`);
        sqlParams.push(...statuses);
      }
    }

    if (params.status_group) {
      const group = params.status_group;
      if (group === '2xx') conditions.push(`status >= 200 AND status < 300`);
      else if (group === '3xx') conditions.push(`status >= 300 AND status < 400`);
      else if (group === '4xx') conditions.push(`status >= 400 AND status < 500`);
      else if (group === '5xx') conditions.push(`status >= 500 AND status < 600`);
    }

    if (params.origin) {
      const origins = params.origin.split(',').map((o) => o.trim().toUpperCase());
      const placeholders = origins.map(() => '?').join(',');
      conditions.push(`origin IN (${placeholders})`);
      sqlParams.push(...origins);
    }

    if (params.start_date) {
      conditions.push(`created_at >= ?`);
      sqlParams.push(params.start_date);
    }

    if (params.end_date) {
      conditions.push(`created_at <= ?`);
      sqlParams.push(params.end_date);
    }

    if (params.query_text) {
      const q = `%${params.query_text.toLowerCase()}%`;
      conditions.push(`(
        LOWER(url) LIKE ? OR
        LOWER(path) LIKE ? OR
        LOWER(host) LIKE ? OR
        remote_ip LIKE ? OR
        LOWER(usuario_logado) LIKE ? OR
        LOWER(exception) LIKE ? OR
        LOWER(tags) LIKE ?
      )`);
      sqlParams.push(q, q, q, q, q, q, q);
    }

    if (params.user) {
      conditions.push(`LOWER(usuario_logado) LIKE ?`);
      sqlParams.push(`%${params.user.toLowerCase()}%`);
    }

    if (params.min_duration !== undefined && !isNaN(params.min_duration)) {
      conditions.push(`total_time >= ?`);
      sqlParams.push(params.min_duration);
    }

    if (params.max_duration !== undefined && !isNaN(params.max_duration)) {
      conditions.push(`total_time <= ?`);
      sqlParams.push(params.max_duration);
    }

    if (params.tag) {
      conditions.push(`LOWER(tags) LIKE ?`);
      sqlParams.push(`%${params.tag.toLowerCase()}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRow = this.db.prepare(`SELECT COUNT(*) as total FROM logs ${whereClause}`).get(...sqlParams) as { total: number };
    const total = countRow ? countRow.total : 0;

    const validSortFields = ['created_at', 'duration', 'total_time', 'status', 'method', 'url'];
    const sortBy = validSortFields.includes(params.sort_by || '') ? params.sort_by : 'created_at';
    const sortOrder = params.sort_order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const page = params.page || 1;
    const limit = params.limit || 50;
    const offset = (page - 1) * limit;

    const rows = this.db.prepare(`
      SELECT * FROM logs ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `).all(...sqlParams, limit, offset) as any[];

    return {
      data: rows.map((r) => this.mapLogRow(r)),
      meta: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit) || 1,
      },
    };
  }

  private mapLogRow(row: any): HttpLog {
    let query = {};
    let headers = {};
    let request_body = null;
    let response_body = null;
    let tags: string[] = [];
    let cookies = {};
    let response_headers = {};

    try { query = row.query ? JSON.parse(row.query) : {}; } catch { query = row.query || {}; }
    try { headers = row.headers ? JSON.parse(row.headers) : {}; } catch { headers = {}; }
    try { request_body = row.request_body ? JSON.parse(row.request_body) : row.request_body; } catch { request_body = row.request_body; }
    try { response_body = row.response_body ? JSON.parse(row.response_body) : row.response_body; } catch { response_body = row.response_body; }
    try { tags = row.tags ? JSON.parse(row.tags) : []; } catch { tags = []; }
    try { cookies = row.cookies ? JSON.parse(row.cookies) : {}; } catch { cookies = {}; }
    try { response_headers = row.response_headers ? JSON.parse(row.response_headers) : {}; } catch { response_headers = {}; }

    return {
      uuid: row.uuid,
      application_id: row.application_id,
      application_name: row.application_name,
      application_color: row.application_color,
      created_at: row.created_at,
      method: row.method,
      url: row.url,
      host: row.host,
      path: row.path,
      query,
      headers,
      request_body,
      response_body,
      status: row.status,
      duration: row.duration,
      dns_time: row.dns_time,
      ssl_time: row.ssl_time,
      connect_time: row.connect_time,
      total_time: row.total_time,
      memory_usage: row.memory_usage,
      peak_memory: row.peak_memory,
      remote_ip: row.remote_ip,
      user_agent: row.user_agent,
      origin: row.origin,
      usuario_logado: row.usuario_logado,
      request_id: row.request_id,
      session_id: row.session_id,
      trace_id: row.trace_id,
      exception: row.exception,
      stack_trace: row.stack_trace,
      tags,
      cookies,
      response_headers,
    };
  }

  // --- Stats Engine ---
  public getDashboardStats(): DashboardStats {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    const total_requests = (this.db.prepare(`SELECT COUNT(*) as count FROM logs`).get() as any)?.count || 0;
    const requests_today = (this.db.prepare(`SELECT COUNT(*) as count FROM logs WHERE created_at >= ?`).get(startOfDay) as any)?.count || 0;
    const total_errors = (this.db.prepare(`SELECT COUNT(*) as count FROM logs WHERE status >= 400`).get() as any)?.count || 0;
    const errors_today = (this.db.prepare(`SELECT COUNT(*) as count FROM logs WHERE status >= 400 AND created_at >= ?`).get(startOfDay) as any)?.count || 0;

    const durationRow = this.db.prepare(`SELECT AVG(total_time) as avg_dur, MAX(total_time) as max_dur FROM logs`).get() as any;
    const avg_duration = Math.round(durationRow?.avg_dur || 0);
    const max_duration = Math.round(durationRow?.max_dur || 0);

    const memRow = this.db.prepare(`SELECT AVG(peak_memory) as avg_mem FROM logs`).get() as any;
    const avg_memory_mb = Number(((memRow?.avg_mem || 0) / (1024 * 1024)).toFixed(2));

    // Requests per minute (Last 30 minutes)
    const thirtyMinsAgo = new Date(now.getTime() - 30 * 60000).toISOString();
    const recentLogs = this.db.prepare(`SELECT created_at, status FROM logs WHERE created_at >= ? ORDER BY created_at ASC`).all(thirtyMinsAgo) as any[];

    const rpmMap: Record<string, { count: number; errors: number }> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 60000);
      const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      rpmMap[timeStr] = { count: 0, errors: 0 };
    }

    recentLogs.forEach((l) => {
      const d = new Date(l.created_at);
      const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      if (rpmMap[timeStr]) {
        rpmMap[timeStr].count++;
        if (l.status >= 400) rpmMap[timeStr].errors++;
      }
    });

    const requests_per_minute = Object.entries(rpmMap).map(([timestamp, data]) => ({
      timestamp,
      count: data.count,
      errors: data.errors,
    }));

    // Requests per hour (Last 24 hours)
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 3600000).toISOString();
    const hourlyLogs = this.db.prepare(`SELECT created_at FROM logs WHERE created_at >= ? ORDER BY created_at ASC`).all(twentyFourHoursAgo) as any[];

    const rphMap: Record<string, number> = {};
    for (let i = 23; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 3600000);
      const hourStr = `${d.getHours().toString().padStart(2, '0')}:00`;
      rphMap[hourStr] = 0;
    }

    hourlyLogs.forEach((l) => {
      const d = new Date(l.created_at);
      const hourStr = `${d.getHours().toString().padStart(2, '0')}:00`;
      if (rphMap[hourStr] !== undefined) {
        rphMap[hourStr]++;
      }
    });

    const requests_per_hour = Object.entries(rphMap).map(([timestamp, count]) => ({
      timestamp,
      count,
    }));

    // Status breakdown
    const s2xx = (this.db.prepare(`SELECT COUNT(*) as count FROM logs WHERE status >= 200 AND status < 300`).get() as any)?.count || 0;
    const s3xx = (this.db.prepare(`SELECT COUNT(*) as count FROM logs WHERE status >= 300 AND status < 400`).get() as any)?.count || 0;
    const s4xx = (this.db.prepare(`SELECT COUNT(*) as count FROM logs WHERE status >= 400 AND status < 500`).get() as any)?.count || 0;
    const s5xx = (this.db.prepare(`SELECT COUNT(*) as count FROM logs WHERE status >= 500`).get() as any)?.count || 0;

    const status_breakdown = [
      { status_group: '2xx Success', count: s2xx, color: '#10b981' },
      { status_group: '3xx Redirect', count: s3xx, color: '#3b82f6' },
      { status_group: '4xx Client Error', count: s4xx, color: '#f59e0b' },
      { status_group: '5xx Server Error', count: s5xx, color: '#ef4444' },
    ];

    // Top URLs
    const topUrlsRows = this.db.prepare(`
      SELECT method, path, url, COUNT(*) as count, AVG(total_time) as avg_duration
      FROM logs
      GROUP BY method, path, url
      ORDER BY count DESC
      LIMIT 10
    `).all() as any[];

    const top_urls = topUrlsRows.map((r) => ({
      url: `${r.method} ${r.path || r.url}`,
      count: r.count,
      avg_duration: Math.round(r.avg_duration || 0),
    }));

    // Top Errors
    const topErrorRows = this.db.prepare(`
      SELECT method, path, url, status, exception, COUNT(*) as count, MAX(created_at) as last_occurred
      FROM logs
      WHERE status >= 400
      GROUP BY method, path, url, status, exception
      ORDER BY count DESC
      LIMIT 10
    `).all() as any[];

    const top_errors = topErrorRows.map((r) => ({
      url: `${r.method} ${r.path || r.url}`,
      status: r.status,
      exception: r.exception,
      count: r.count,
      last_occurred: r.last_occurred,
    }));

    // Top Applications
    const apps = this.getApplications();
    const top_applications = apps.map((app) => {
      const appCount = (this.db.prepare(`SELECT COUNT(*) as count FROM logs WHERE application_id = ?`).get(app.id) as any)?.count || 0;
      const appErrors = (this.db.prepare(`SELECT COUNT(*) as count FROM logs WHERE application_id = ? AND status >= 400`).get(app.id) as any)?.count || 0;
      return {
        id: app.id,
        name: app.name,
        count: appCount,
        color: app.color,
        error_rate: appCount > 0 ? Number(((appErrors / appCount) * 100).toFixed(1)) : 0,
      };
    }).sort((a, b) => b.count - a.count);

    // Top Hosts
    const topHostsRows = this.db.prepare(`
      SELECT host, COUNT(*) as count
      FROM logs
      WHERE host IS NOT NULL AND host != ''
      GROUP BY host
      ORDER BY count DESC
      LIMIT 10
    `).all() as any[];

    const top_hosts = topHostsRows.map((r) => ({ host: r.host, count: r.count }));

    // Top Users
    const topUsersRows = this.db.prepare(`
      SELECT usuario_logado as user, COUNT(*) as count
      FROM logs
      WHERE usuario_logado IS NOT NULL AND usuario_logado != ''
      GROUP BY usuario_logado
      ORDER BY count DESC
      LIMIT 10
    `).all() as any[];

    const top_users = topUsersRows.map((r) => ({ user: r.user, count: r.count }));

    return {
      total_requests,
      requests_today,
      total_errors,
      errors_today,
      avg_duration,
      max_duration,
      avg_memory_mb,
      requests_per_minute,
      requests_per_hour,
      status_breakdown,
      top_urls,
      top_errors,
      top_applications,
      top_hosts,
      top_users,
    };
  }

  // --- Alert Rules & Triggered Alerts ---
  public getAlertRules(): AlertRule[] {
    const rows = this.db.prepare(`SELECT * FROM alert_rules ORDER BY created_at ASC`).all() as any[];
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      type: r.type,
      application_id: r.application_id || undefined,
      threshold_value: r.threshold_value,
      time_window_seconds: r.time_window_seconds,
      enabled: Boolean(r.enabled),
      created_at: r.created_at,
    }));
  }

  public createAlertRule(rule: Omit<AlertRule, 'id' | 'created_at'>): AlertRule {
    const newRule: AlertRule = {
      id: `rule_${randomUUID().substring(0, 8)}`,
      ...rule,
      created_at: new Date().toISOString(),
    };

    this.db.prepare(`
      INSERT INTO alert_rules (id, name, type, application_id, threshold_value, time_window_seconds, enabled, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      newRule.id,
      newRule.name,
      newRule.type,
      newRule.application_id || null,
      newRule.threshold_value,
      newRule.time_window_seconds,
      newRule.enabled ? 1 : 0,
      newRule.created_at
    );

    return newRule;
  }

  public getTriggeredAlerts(): TriggeredAlert[] {
    const rows = this.db.prepare(`SELECT * FROM triggered_alerts ORDER BY triggered_at DESC LIMIT 500`).all() as any[];
    return rows.map((r) => ({
      id: r.id,
      rule_id: r.rule_id,
      rule_name: r.rule_name,
      application_id: r.application_id || undefined,
      application_name: r.application_name || undefined,
      message: r.message,
      severity: (r.severity as any) || 'warning',
      triggered_at: r.triggered_at,
      resolved: Boolean(r.resolved),
      metadata: r.metadata ? JSON.parse(r.metadata) : undefined,
    }));
  }

  public addTriggeredAlert(alert: Omit<TriggeredAlert, 'id' | 'triggered_at' | 'resolved'>): TriggeredAlert {
    const newAlert: TriggeredAlert = {
      id: `alert_${randomUUID().substring(0, 8)}`,
      ...alert,
      triggered_at: new Date().toISOString(),
      resolved: false,
    };

    this.db.prepare(`
      INSERT INTO triggered_alerts (id, rule_id, rule_name, application_id, application_name, message, severity, triggered_at, resolved, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
    `).run(
      newAlert.id,
      newAlert.rule_id,
      newAlert.rule_name,
      newAlert.application_id || null,
      newAlert.application_name || null,
      newAlert.message,
      newAlert.severity || 'warning',
      newAlert.triggered_at,
      newAlert.metadata ? JSON.stringify(newAlert.metadata) : null
    );

    return newAlert;
  }

  public resolveAlert(id: string): boolean {
    const res = this.db.prepare(`UPDATE triggered_alerts SET resolved = 1 WHERE id = ?`).run(id);
    return res.changes > 0;
  }
}

export const db = new SqliteDatabase();
