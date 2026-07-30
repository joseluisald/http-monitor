import { z } from 'zod';

export const HttpMethodSchema = z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']);
export const RequestOriginSchema = z.enum(['WEB', 'AJAX', 'CLI', 'QUEUE', 'CRON']);

export const CreateHttpLogSchema = z.object({
  method: HttpMethodSchema,
  url: z.string().min(1, 'URL is required'),
  host: z.string().optional(),
  path: z.string().optional(),
  query: z.any().optional(),
  headers: z.any().optional(),
  request_body: z.any().optional(),
  response_body: z.any().optional(),
  status: z.number().int().min(100).max(599),
  duration: z.number().nonnegative().optional().default(0),
  dns_time: z.number().nonnegative().optional().default(0),
  ssl_time: z.number().nonnegative().optional().default(0),
  connect_time: z.number().nonnegative().optional().default(0),
  total_time: z.number().nonnegative().optional().default(0),
  memory_usage: z.number().nonnegative().optional().default(0),
  peak_memory: z.number().nonnegative().optional().default(0),
  remote_ip: z.string().optional().default('127.0.0.1'),
  user_agent: z.string().optional().default('PHP/8.3 HTTP Monitor Client'),
  origin: RequestOriginSchema.optional().default('WEB'),
  usuario_logado: z.string().nullable().optional().default(null),
  request_id: z.string().optional(),
  session_id: z.string().optional(),
  trace_id: z.string().optional(),
  exception: z.string().nullable().optional().default(null),
  stack_trace: z.string().nullable().optional().default(null),
  tags: z.array(z.string()).optional().default([]),
  cookies: z.any().optional(),
  response_headers: z.any().optional(),
});

export const CreateApplicationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  environment: z.enum(['production', 'staging', 'development']).default('production'),
  color: z.string().optional().default('#3b82f6'),
  token: z.string().optional(),
});

export const UpdateApplicationSchema = z.object({
  name: z.string().min(2).optional(),
  environment: z.enum(['production', 'staging', 'development']).optional(),
  color: z.string().optional(),
  active: z.boolean().optional(),
});

export const CreateAlertRuleSchema = z.object({
  name: z.string().min(3),
  type: z.enum(['error_threshold', 'latency_threshold', 'request_rate', 'app_offline', 'slow_webhook']),
  application_id: z.string().optional().nullable(),
  threshold_value: z.number().positive(),
  time_window_seconds: z.number().positive().default(60),
  enabled: z.boolean().default(true),
});
