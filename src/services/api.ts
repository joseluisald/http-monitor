import {
  Application,
  HttpLog,
  LogFilterParams,
  PaginatedResponse,
  DashboardStats,
  AlertRule,
  TriggeredAlert,
} from '../types';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorBody.message || `HTTP error ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Logs
  async getLogs(params: LogFilterParams): Promise<PaginatedResponse<HttpLog>> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    return fetchJson<PaginatedResponse<HttpLog>>(`/api/logs?${query.toString()}`);
  },

  async getLogById(id: string): Promise<HttpLog> {
    return fetchJson<HttpLog>(`/api/logs/${id}`);
  },

  // Stats
  async getStats(): Promise<DashboardStats> {
    return fetchJson<DashboardStats>('/api/stats');
  },

  // Applications
  async getApplications(): Promise<Application[]> {
    return fetchJson<Application[]>('/api/applications');
  },

  async createApplication(data: { name: string; environment?: string; color?: string }): Promise<Application> {
    return fetchJson<Application>('/api/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateApplication(id: string, data: Partial<Application>): Promise<Application> {
    return fetchJson<Application>(`/api/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteApplication(id: string): Promise<{ success: boolean }> {
    return fetchJson<{ success: boolean }>(`/api/applications/${id}`, {
      method: 'DELETE',
    });
  },

  // Alerts
  async getAlertRules(): Promise<AlertRule[]> {
    return fetchJson<AlertRule[]>('/api/alerts/rules');
  },

  async createAlertRule(data: Partial<AlertRule>): Promise<AlertRule> {
    return fetchJson<AlertRule>('/api/alerts/rules', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getTriggeredAlerts(): Promise<TriggeredAlert[]> {
    return fetchJson<TriggeredAlert[]>('/api/alerts');
  },

  async resolveAlert(id: string): Promise<{ success: boolean }> {
    return fetchJson<{ success: boolean }>(`/api/alerts/${id}/resolve`, {
      method: 'PUT',
    });
  },

  // Mock traffic generator
  async getMockStatus(): Promise<{ active: boolean }> {
    return fetchJson<{ active: boolean }>('/api/mock/status');
  },

  async toggleMockTraffic(): Promise<{ active: boolean; message: string }> {
    return fetchJson<{ active: boolean; message: string }>('/api/mock/toggle', { method: 'POST' });
  },

  async triggerMockRequest(): Promise<{ success: boolean }> {
    return fetchJson<{ success: boolean }>('/api/mock/trigger', { method: 'POST' });
  },
};
