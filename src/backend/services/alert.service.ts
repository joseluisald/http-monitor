import { db } from '../database/db.js';
import { HttpLog, AlertRule } from '../types.js';
import { broadcastAlert } from '../websocket/socket.js';

class AlertService {
  public evaluateNewLog(log: HttpLog) {
    const rules = db.getAlertRules().filter((r) => r.enabled);

    rules.forEach((rule) => {
      // Check application scope
      if (rule.application_id && rule.application_id !== log.application_id) {
        return;
      }

      const app = db.getApplicationById(log.application_id);
      const appName = app ? app.name : 'Unknown App';

      // 1. Error Threshold (e.g., status 500 or >= 400)
      if (rule.type === 'error_threshold') {
        if (log.status >= 500) {
          // Count recent 500 errors in time window
          const cutoff = new Date(Date.now() - rule.time_window_seconds * 1000).toISOString();
          const query = db.queryLogs({
            application_id: log.application_id,
            status_group: '5xx',
            start_date: cutoff,
            limit: 100,
          });

          if (query.meta.total >= rule.threshold_value) {
            const alert = db.addTriggeredAlert({
              rule_id: rule.id,
              rule_name: rule.name,
              application_id: log.application_id,
              application_name: appName,
              message: `Atenção: ${query.meta.total} erros 500 detectados em ${appName} nos últimos ${rule.time_window_seconds}s (Limiar: ${rule.threshold_value}).`,
              severity: 'critical',
            });
            broadcastAlert(alert);
          }
        }
      }

      // 2. Latency Threshold (e.g. duration > 2000ms)
      if (rule.type === 'latency_threshold') {
        if (log.total_time >= rule.threshold_value) {
          const alert = db.addTriggeredAlert({
            rule_id: rule.id,
            rule_name: rule.name,
            application_id: log.application_id,
            application_name: appName,
            message: `Alerta de Latência: Requisição ${log.method} ${log.path} demorou ${log.total_time}ms em ${appName} (Limiar: ${rule.threshold_value}ms).`,
            severity: 'warning',
            metadata: { url: log.url, duration: log.total_time },
          });
          broadcastAlert(alert);
        }
      }

      // 3. Slow Webhook (e.g. path contains webhook and duration > 10000ms)
      if (rule.type === 'slow_webhook') {
        if ((log.path.includes('webhook') || log.url.includes('webhook')) && log.total_time >= rule.threshold_value) {
          const alert = db.addTriggeredAlert({
            rule_id: rule.id,
            rule_name: rule.name,
            application_id: log.application_id,
            application_name: appName,
            message: `Webhook Lento: ${log.method} ${log.path} demorou ${log.total_time}ms em ${appName} (Limiar: ${rule.threshold_value}ms).`,
            severity: 'warning',
            metadata: { url: log.url, duration: log.total_time },
          });
          broadcastAlert(alert);
        }
      }
    });
  }
}

export const alertService = new AlertService();
