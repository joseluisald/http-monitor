import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
const uuidv4 = randomUUID;
import { Application, HttpLog, AlertRule, TriggeredAlert, LogFilterParams, DashboardStats } from '../types.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface DatabaseStore {
  applications: Application[];
  logs: HttpLog[];
  alert_rules: AlertRule[];
  triggered_alerts: TriggeredAlert[];
  saved_filters: { id: string; name: string; filter: LogFilterParams; created_at: string }[];
}

class Database {
  private store: DatabaseStore = {
    applications: [],
    logs: [],
    alert_rules: [],
    triggered_alerts: [],
    saved_filters: [],
  };

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.store = JSON.parse(raw);
      } else {
        this.save();
      }
    } catch (err) {
      console.error('Error initializing database file, resetting in-memory store:', err);
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.store, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving database to file:', err);
    }
  }

  // --- Applications ---
  public getApplications(): Application[] {
    return [...this.store.applications];
  }

  public getApplicationById(id: string): Application | undefined {
    return this.store.applications.find((app) => app.id === id);
  }

  public getApplicationByToken(token: string): Application | undefined {
    return this.store.applications.find((app) => app.token === token);
  }

  public createApplication(data: { name: string; environment?: string; color?: string; token?: string }): Application {
    const now = new Date().toISOString();
    const app: Application = {
      id: `app_${uuidv4().substring(0, 8)}`,
      name: data.name,
      token: data.token || `tok_${uuidv4().replace(/-/g, '')}`,
      environment: data.environment || 'production',
      color: data.color || '#3b82f6',
      active: true,
      created_at: now,
      updated_at: now,
      last_seen_at: now,
      total_requests_today: 0,
    };

    this.store.applications.push(app);
    this.save();
    return app;
  }

  public updateApplication(id: string, updates: Partial<Application>): Application | null {
    const idx = this.store.applications.findIndex((a) => a.id === id);
    if (idx === -1) return null;

    this.store.applications[idx] = {
      ...this.store.applications[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    this.save();
    return this.store.applications[idx];
  }

  public deleteApplication(id: string): boolean {
    const initialLen = this.store.applications.length;
    this.store.applications = this.store.applications.filter((a) => a.id !== id);
    if (this.store.applications.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  public touchApplication(id: string) {
    const app = this.getApplicationById(id);
    if (app) {
      app.last_seen_at = new Date().toISOString();
      app.total_requests_today = (app.total_requests_today || 0) + 1;
      this.save();
    }
  }

  // --- Logs ---
  public addLog(log: HttpLog): HttpLog {
    this.store.logs.unshift(log); // newest first

    // Limit memory footprint if logs exceed 100,000
    if (this.store.logs.length > 100000) {
      this.store.logs = this.store.logs.slice(0, 100000);
    }

    this.touchApplication(log.application_id);
    this.save();
    return log;
  }

  public getLogById(uuid: string): HttpLog | undefined {
    return this.store.logs.find((l) => l.uuid === uuid);
  }

  public queryLogs(params: LogFilterParams) {
    let result = [...this.store.logs];

    // Filters
    if (params.application_id) {
      result = result.filter((l) => l.application_id === params.application_id);
    }

    if (params.method) {
      const methods = params.method.split(',').map((m) => m.trim().toUpperCase());
      result = result.filter((l) => methods.includes(l.method));
    }

    if (params.status) {
      const statuses = params.status.split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
      if (statuses.length > 0) {
        result = result.filter((l) => statuses.includes(l.status));
      }
    }

    if (params.status_group) {
      const group = params.status_group;
      if (group === '2xx') result = result.filter((l) => l.status >= 200 && l.status < 300);
      else if (group === '3xx') result = result.filter((l) => l.status >= 300 && l.status < 400);
      else if (group === '4xx') result = result.filter((l) => l.status >= 400 && l.status < 500);
      else if (group === '5xx') result = result.filter((l) => l.status >= 500 && l.status < 600);
    }

    if (params.origin) {
      const origins = params.origin.split(',').map((o) => o.trim().toUpperCase());
      result = result.filter((l) => origins.includes(l.origin));
    }

    if (params.start_date) {
      const start = new Date(params.start_date).getTime();
      result = result.filter((l) => new Date(l.created_at).getTime() >= start);
    }

    if (params.end_date) {
      const end = new Date(params.end_date).getTime();
      result = result.filter((l) => new Date(l.created_at).getTime() <= end);
    }

    if (params.query_text) {
      const q = params.query_text.toLowerCase();
      result = result.filter(
        (l) =>
          l.url.toLowerCase().includes(q) ||
          l.path.toLowerCase().includes(q) ||
          l.host.toLowerCase().includes(q) ||
          l.remote_ip.includes(q) ||
          (l.usuario_logado && l.usuario_logado.toLowerCase().includes(q)) ||
          (l.exception && l.exception.toLowerCase().includes(q)) ||
          l.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (params.user) {
      const u = params.user.toLowerCase();
      result = result.filter((l) => l.usuario_logado && l.usuario_logado.toLowerCase().includes(u));
    }

    if (params.min_duration !== undefined && !isNaN(params.min_duration)) {
      result = result.filter((l) => l.total_time >= params.min_duration!);
    }

    if (params.max_duration !== undefined && !isNaN(params.max_duration)) {
      result = result.filter((l) => l.total_time <= params.max_duration!);
    }

    if (params.tag) {
      result = result.filter((l) => l.tags.includes(params.tag!));
    }

    // Sort
    const sortBy = params.sort_by || 'created_at';
    const sortOrder = params.sort_order || 'desc';

    result.sort((a, b) => {
      let valA: any = a[sortBy as keyof HttpLog];
      let valB: any = b[sortBy as keyof HttpLog];

      if (sortBy === 'created_at') {
        valA = new Date(a.created_at).getTime();
        valB = new Date(b.created_at).getTime();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const total = result.length;
    const page = params.page || 1;
    const limit = params.limit || 50;
    const startIndex = (page - 1) * limit;
    const paginated = result.slice(startIndex, startIndex + limit);

    return {
      data: paginated,
      meta: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit) || 1,
      },
    };
  }

  // --- Stats Engine ---
  public getDashboardStats(): DashboardStats {
    const logs = this.store.logs;
    const apps = this.store.applications;

    const total_requests = logs.length;

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const logsToday = logs.filter((l) => new Date(l.created_at).getTime() >= startOfDay);
    const requests_today = logsToday.length;

    const total_errors = logs.filter((l) => l.status >= 400).length;
    const errors_today = logsToday.filter((l) => l.status >= 400).length;

    const totalDuration = logs.reduce((acc, l) => acc + (l.total_time || l.duration || 0), 0);
    const avg_duration = total_requests > 0 ? Math.round(totalDuration / total_requests) : 0;
    const max_duration = logs.reduce((max, l) => Math.max(max, l.total_time || l.duration || 0), 0);

    const totalMem = logs.reduce((acc, l) => acc + (l.peak_memory || l.memory_usage || 0), 0);
    const avg_memory_mb = total_requests > 0 ? Number((totalMem / total_requests / (1024 * 1024)).toFixed(2)) : 0;

    // Requests per minute (Last 30 minutes)
    const rpmMap: Record<string, { count: number; errors: number }> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 60000);
      const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      rpmMap[timeStr] = { count: 0, errors: 0 };
    }

    logs.slice(0, 5000).forEach((l) => {
      const d = new Date(l.created_at);
      const diffMinutes = Math.floor((now.getTime() - d.getTime()) / 60000);
      if (diffMinutes < 30) {
        const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
        if (rpmMap[timeStr]) {
          rpmMap[timeStr].count++;
          if (l.status >= 400) rpmMap[timeStr].errors++;
        }
      }
    });

    const requests_per_minute = Object.entries(rpmMap).map(([timestamp, data]) => ({
      timestamp,
      count: data.count,
      errors: data.errors,
    }));

    // Requests per hour (Last 24 hours)
    const rphMap: Record<string, number> = {};
    for (let i = 23; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 3600000);
      const hourStr = `${d.getHours().toString().padStart(2, '0')}:00`;
      rphMap[hourStr] = 0;
    }

    logs.slice(0, 10000).forEach((l) => {
      const d = new Date(l.created_at);
      const diffHours = Math.floor((now.getTime() - d.getTime()) / 3600000);
      if (diffHours < 24) {
        const hourStr = `${d.getHours().toString().padStart(2, '0')}:00`;
        if (rphMap[hourStr] !== undefined) {
          rphMap[hourStr]++;
        }
      }
    });

    const requests_per_hour = Object.entries(rphMap).map(([timestamp, count]) => ({
      timestamp,
      count,
    }));

    // Status breakdown
    let s2xx = 0, s3xx = 0, s4xx = 0, s5xx = 0;
    logs.forEach((l) => {
      if (l.status >= 200 && l.status < 300) s2xx++;
      else if (l.status >= 300 && l.status < 400) s3xx++;
      else if (l.status >= 400 && l.status < 500) s4xx++;
      else if (l.status >= 500) s5xx++;
    });

    const status_breakdown = [
      { status_group: '2xx Success', count: s2xx, color: '#10b981' },
      { status_group: '3xx Redirect', count: s3xx, color: '#3b82f6' },
      { status_group: '4xx Client Error', count: s4xx, color: '#f59e0b' },
      { status_group: '5xx Server Error', count: s5xx, color: '#ef4444' },
    ];

    // Top URLs
    const urlMap: Record<string, { count: number; total_dur: number }> = {};
    logs.forEach((l) => {
      const key = `${l.method} ${l.path || l.url}`;
      if (!urlMap[key]) urlMap[key] = { count: 0, total_dur: 0 };
      urlMap[key].count++;
      urlMap[key].total_dur += l.total_time || l.duration || 0;
    });

    const top_urls = Object.entries(urlMap)
      .map(([url, data]) => ({
        url,
        count: data.count,
        avg_duration: Math.round(data.total_dur / data.count),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top Errors
    const errorMap: Record<string, { url: string; status: number; exception: string | null; count: number; last_occurred: string }> = {};
    logs.filter((l) => l.status >= 400).forEach((l) => {
      const key = `${l.status}_${l.path || l.url}_${l.exception || 'NoException'}`;
      if (!errorMap[key]) {
        errorMap[key] = {
          url: `${l.method} ${l.path || l.url}`,
          status: l.status,
          exception: l.exception,
          count: 0,
          last_occurred: l.created_at,
        };
      }
      errorMap[key].count++;
      if (new Date(l.created_at).getTime() > new Date(errorMap[key].last_occurred).getTime()) {
        errorMap[key].last_occurred = l.created_at;
      }
    });

    const top_errors = Object.values(errorMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top Applications
    const appStatsMap: Record<string, { count: number; errors: number }> = {};
    apps.forEach((a) => {
      appStatsMap[a.id] = { count: 0, errors: 0 };
    });

    logs.forEach((l) => {
      if (!appStatsMap[l.application_id]) {
        appStatsMap[l.application_id] = { count: 0, errors: 0 };
      }
      appStatsMap[l.application_id].count++;
      if (l.status >= 400) appStatsMap[l.application_id].errors++;
    });

    const top_applications = apps
      .map((app) => {
        const stats = appStatsMap[app.id] || { count: 0, errors: 0 };
        return {
          id: app.id,
          name: app.name,
          count: stats.count,
          color: app.color,
          error_rate: stats.count > 0 ? Number(((stats.errors / stats.count) * 100).toFixed(1)) : 0,
        };
      })
      .sort((a, b) => b.count - a.count);

    // Top Hosts
    const hostMap: Record<string, number> = {};
    logs.forEach((l) => {
      if (l.host) {
        hostMap[l.host] = (hostMap[l.host] || 0) + 1;
      }
    });

    const top_hosts = Object.entries(hostMap)
      .map(([host, count]) => ({ host, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top Users
    const userMap: Record<string, number> = {};
    logs.forEach((l) => {
      if (l.usuario_logado) {
        userMap[l.usuario_logado] = (userMap[l.usuario_logado] || 0) + 1;
      }
    });

    const top_users = Object.entries(userMap)
      .map(([user, count]) => ({ user, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

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
    return [...this.store.alert_rules];
  }

  public createAlertRule(rule: Omit<AlertRule, 'id' | 'created_at'>): AlertRule {
    const newRule: AlertRule = {
      id: `rule_${uuidv4().substring(0, 8)}`,
      ...rule,
      created_at: new Date().toISOString(),
    };
    this.store.alert_rules.push(newRule);
    this.save();
    return newRule;
  }

  public getTriggeredAlerts(): TriggeredAlert[] {
    return [...this.store.triggered_alerts];
  }

  public addTriggeredAlert(alert: Omit<TriggeredAlert, 'id' | 'triggered_at' | 'resolved'>): TriggeredAlert {
    const newAlert: TriggeredAlert = {
      id: `alert_${uuidv4().substring(0, 8)}`,
      ...alert,
      triggered_at: new Date().toISOString(),
      resolved: false,
    };
    this.store.triggered_alerts.unshift(newAlert);
    if (this.store.triggered_alerts.length > 500) {
      this.store.triggered_alerts = this.store.triggered_alerts.slice(0, 500);
    }
    this.save();
    return newAlert;
  }

  public resolveAlert(id: string): boolean {
    const alert = this.store.triggered_alerts.find((a) => a.id === id);
    if (alert) {
      alert.resolved = true;
      this.save();
      return true;
    }
    return false;
  }
}

export const db = new Database();
