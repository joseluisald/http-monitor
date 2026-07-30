import { db } from '../database/db.js';

export function seedInitialData() {
  const existingApps = db.getApplications();

  if (existingApps.length === 0) {
    db.createApplication({
      name: 'Aplicação Principal',
      environment: 'production',
      color: '#6366f1',
      token: 'tok_app_principal_8f92a',
    });

    // Seed default Alert Rules
    db.createAlertRule({
      name: 'Mais de 20 erros 500 em 1 minuto',
      type: 'error_threshold',
      threshold_value: 20,
      time_window_seconds: 60,
      enabled: true,
    });

    db.createAlertRule({
      name: 'Tempo médio acima de 2 segundos',
      type: 'latency_threshold',
      threshold_value: 2000,
      time_window_seconds: 60,
      enabled: true,
    });
  }
}
