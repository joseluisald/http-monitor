export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';

export type RequestOrigin = 'WEB' | 'AJAX' | 'CLI' | 'QUEUE' | 'CRON';

export interface Application {
  id: string;
  name: string;
  token: string;
  environment: string; // 'production' | 'staging' | 'development'
  color: string;       // hex color or tailwind class
  active: boolean;
  created_at: string;
  updated_at: string;
  last_seen_at?: string;
  total_requests_today?: number;
}

export interface HttpLog {
  uuid: string;
  application_id: string;
  application_name?: string;
  application_color?: string;
  created_at: string;
  method: HttpMethod;
  url: string;
  host: string;
  path: string;
  query: Record<string, any> | string;
  headers: Record<string, any>;
  request_body: any;
  response_body: any;
  status: number;
  duration: number; // ms
  dns_time: number; // ms
  ssl_time: number; // ms
  connect_time: number; // ms
  total_time: number; // ms
  memory_usage: number; // in bytes or MB
  peak_memory: number; // in bytes or MB
  remote_ip: string;
  user_agent: string;
  origin: RequestOrigin;
  usuario_logado: string | null;
  request_id: string;
  session_id: string;
  trace_id: string;
  exception: string | null;
  stack_trace: string | null;
  tags: string[];
  cookies?: Record<string, any>;
  response_headers?: Record<string, any>;
}

export interface LogFilterParams {
  application_id?: string;
  method?: string;
  status?: string;
  status_group?: '2xx' | '3xx' | '4xx' | '5xx';
  origin?: string;
  start_date?: string;
  end_date?: string;
  query_text?: string;
  url_path?: string;
  user?: string;
  min_duration?: number;
  max_duration?: number;
  tag?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface DashboardStats {
  total_requests: number;
  requests_today: number;
  total_errors: number;
  errors_today: number;
  avg_duration: number;
  max_duration: number;
  avg_memory_mb: number;
  requests_per_minute: { timestamp: string; count: number; errors: number }[];
  requests_per_hour: { timestamp: string; count: number }[];
  status_breakdown: { status_group: string; count: number; color: string }[];
  top_urls: { url: string; count: number; avg_duration: number }[];
  top_errors: { url: string; status: number; exception: string | null; count: number; last_occurred: string }[];
  top_applications: { id: string; name: string; count: number; color: string; error_rate: number }[];
  top_hosts: { host: string; count: number }[];
  top_users: { user: string; count: number }[];
}

export interface AlertRule {
  id: string;
  name: string;
  type: 'error_threshold' | 'latency_threshold' | 'request_rate' | 'app_offline' | 'slow_webhook';
  application_id?: string; // null means all applications
  threshold_value: number; // e.g. 20 (errors), 2000 (ms), 50 (req/sec), 10000 (webhook ms)
  time_window_seconds: number; // e.g. 60
  enabled: boolean;
  created_at: string;
}

export interface TriggeredAlert {
  id: string;
  rule_id: string;
  rule_name: string;
  application_id?: string;
  application_name?: string;
  message: string;
  severity: 'warning' | 'critical' | 'info';
  triggered_at: string;
  resolved: boolean;
  metadata?: Record<string, any>;
}

export interface CreateLogDTO {
  method: HttpMethod;
  url: string;
  host?: string;
  path?: string;
  query?: any;
  headers?: any;
  request_body?: any;
  response_body?: any;
  status: number;
  duration?: number;
  dns_time?: number;
  ssl_time?: number;
  connect_time?: number;
  total_time?: number;
  memory_usage?: number;
  peak_memory?: number;
  remote_ip?: string;
  user_agent?: string;
  origin?: RequestOrigin;
  usuario_logado?: string | null;
  request_id?: string;
  session_id?: string;
  trace_id?: string;
  exception?: string | null;
  stack_trace?: string | null;
  tags?: string[];
  cookies?: any;
  response_headers?: any;
}
