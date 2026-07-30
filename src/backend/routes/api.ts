import { Router } from 'express';
import { authenticateBearerToken } from '../middlewares/auth.middleware.js';
import { ingestHttpLog, getLogs, getLogById } from '../controllers/log.controller.js';
import {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
} from '../controllers/application.controller.js';
import { getStats } from '../controllers/stats.controller.js';
import { getAlertRules, createAlertRule, getTriggeredAlerts, resolveAlert } from '../controllers/alert.controller.js';
import { exportLogsJson, exportLogsCsv } from '../controllers/export.controller.js';
import { toggleMockTrafficGenerator, isTrafficGeneratorActive, generateRandomLog } from '../utils/mockTraffic.js';

const router = Router();

// Ingestion endpoint (Secured via Bearer token)
router.post('/http', authenticateBearerToken, ingestHttpLog);

// Log endpoints
router.get('/logs', getLogs);
router.get('/logs/:id', getLogById);

// Analytics & Dashboard Stats
router.get('/stats', getStats);

// Applications CRUD
router.get('/applications', getApplications);
router.get('/applications/:id', getApplicationById);
router.post('/applications', createApplication);
router.put('/applications/:id', updateApplication);
router.delete('/applications/:id', deleteApplication);

// Alerts
router.get('/alerts/rules', getAlertRules);
router.post('/alerts/rules', createAlertRule);
router.get('/alerts', getTriggeredAlerts);
router.put('/alerts/:id/resolve', resolveAlert);

// Data Export
router.get('/export/json', exportLogsJson);
router.get('/export/csv', exportLogsCsv);

// Mock Generator Toggle / Trigger
router.get('/mock/status', (req, res) => {
  res.json({ active: isTrafficGeneratorActive() });
});

router.post('/mock/toggle', (req, res) => {
  const active = toggleMockTrafficGenerator();
  res.json({ active, message: active ? 'Mock traffic generator started' : 'Mock traffic generator paused' });
});

router.post('/mock/trigger', (req, res) => {
  generateRandomLog();
  res.json({ success: true, message: 'Mock HTTP log generated' });
});

export default router;
