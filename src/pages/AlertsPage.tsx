import React, { useEffect, useState } from 'react';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Plus,
  ShieldAlert,
  Clock,
  Sparkles,
  Check,
} from 'lucide-react';
import { AlertRule, TriggeredAlert } from '../types';
import { api } from '../services/api';

export function AlertsPage() {
  const [alerts, setAlerts] = useState<TriggeredAlert[]>([]);
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRuleModal, setShowRuleModal] = useState(false);

  const [ruleName, setRuleName] = useState('');
  const [ruleType, setRuleType] = useState<AlertRule['type']>('error_threshold');
  const [thresholdValue, setThresholdValue] = useState(20);
  const [timeWindow, setTimeWindow] = useState(60);

  const loadData = async () => {
    try {
      const [fetchedAlerts, fetchedRules] = await Promise.all([
        api.getTriggeredAlerts(),
        api.getAlertRules(),
      ]);
      setAlerts(fetchedAlerts);
      setRules(fetchedRules);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResolveAlert = async (id: string) => {
    try {
      await api.resolveAlert(id);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim()) return;

    try {
      await api.createAlertRule({
        name: ruleName,
        type: ruleType,
        threshold_value: Number(thresholdValue),
        time_window_seconds: Number(timeWindow),
        enabled: true,
      });

      setRuleName('');
      setShowRuleModal(false);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-500" />
            <span>Regras & Incidentes de Alerta</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Notificações automáticas ao detectar picos de erros 500, latência alta ou webhooks lentos</p>
        </div>

        <button
          onClick={() => setShowRuleModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Regra de Alerta</span>
        </button>
      </div>

      {/* Grid of Alert Rules */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Regras de Monitoramento Ativas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{rule.name}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Limiar: <span className="font-bold text-indigo-500">{rule.threshold_value}</span> (Janela: {rule.time_window_seconds}s)
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Triggered Alerts History Feed */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          <span>Feed de Incidentes Disparados</span>
        </h3>

        <div className="space-y-3">
          {isLoading ? (
            <div className="py-8 text-center text-slate-400">Carregando incidentes...</div>
          ) : alerts.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Nenhum Incidente Ativo</p>
              <p className="text-xs mt-1">Todas as métricas de saúde HTTP estão normais.</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border flex items-start justify-between gap-4 transition-all ${
                  alert.resolved
                    ? 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 opacity-60'
                    : alert.severity === 'critical'
                    ? 'bg-rose-500/10 border-rose-500/30'
                    : 'bg-amber-500/10 border-amber-500/30'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{alert.rule_name}</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(alert.triggered_at).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-mono leading-relaxed">{alert.message}</p>
                </div>

                {!alert.resolved ? (
                  <button
                    onClick={() => handleResolveAlert(alert.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg border border-emerald-500/20 shrink-0"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Resolver</span>
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-emerald-500 font-mono shrink-0">Resolvido</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Alert Rule Modal */}
      {showRuleModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Criar Nova Regra de Alerta</h3>

            <form onSubmit={handleCreateRule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome do Alerta</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Erros 500 no ERP acima do limite"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tipo de Regra</label>
                <select
                  value={ruleType}
                  onChange={(e) => setRuleType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="error_threshold">Quantidade de Erros 500</option>
                  <option value="latency_threshold">Latência Lenta (&gt; ms)</option>
                  <option value="slow_webhook">Webhook Lento (&gt; ms)</option>
                  <option value="request_rate">Taxa Alta de Requests / sec</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Valor Limiar (Threshold)</label>
                <input
                  type="number"
                  required
                  value={thresholdValue}
                  onChange={(e) => setThresholdValue(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Janela de Tempo (Segundos)</label>
                <input
                  type="number"
                  required
                  value={timeWindow}
                  onChange={(e) => setTimeWindow(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRuleModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md"
                >
                  Criar Regra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
