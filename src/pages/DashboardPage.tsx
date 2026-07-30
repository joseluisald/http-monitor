import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertCircle,
  Clock,
  HardDrive,
  CheckCircle2,
  TrendingUp,
  Zap,
  ArrowUpRight,
  Server,
} from 'lucide-react';
import { DashboardStats, HttpLog } from '../types';
import { api } from '../services/api';
import { useLogStore } from '../stores/useLogStore';
import { RequestsOverTimeChart } from '../components/Charts/RequestsOverTimeChart';
import { StatusDistributionChart } from '../components/Charts/StatusDistributionChart';
import { StatusBadge } from '../components/StatusBadge';
import { MethodBadge } from '../components/MethodBadge';
import { DurationBadge } from '../components/DurationBadge';

interface DashboardPageProps {
  onNavigateToLogs: () => void;
}

export function DashboardPage({ onNavigateToLogs }: DashboardPageProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setSelectedLog } = useLogStore();

  const loadStats = async () => {
    try {
      const data = await api.getStats();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 5000); // refresh stats every 5s
    return () => clearInterval(interval);
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <Activity className="w-8 h-8 text-indigo-500 animate-spin" />
          <span className="text-xs font-mono text-slate-400">Carregando métricas do Telescope...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                TELEMETRIA REALTIME
              </span>
              <span className="text-xs text-slate-400">Laravel Telescope Architecture</span>
            </div>
            <h2 className="text-xl font-bold font-sans tracking-tight">HTTP Request Monitor Dashboard</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Monitorando em tempo real todas as requisições HTTP enviadas por suas aplicações PHP e microsserviços.
            </p>
          </div>

          <button
            onClick={onNavigateToLogs}
            className="self-start md:self-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
          >
            <span>Ver Tabela Completa</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Telescope Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Requests */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Requests</span>
            <Activity className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100">{stats.total_requests}</p>
          <span className="text-[10px] text-slate-500 block">{stats.requests_today} hoje</span>
        </div>

        {/* Requests Today */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Requests Hoje</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100">{stats.requests_today}</p>
          <span className="text-[10px] text-emerald-500 font-medium block">Ativo 24h</span>
        </div>

        {/* Total Errors */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Erros</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-mono font-bold text-rose-500">{stats.total_errors}</p>
          <span className="text-[10px] text-rose-400 block">{stats.errors_today} erros hoje</span>
        </div>

        {/* Avg Duration */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Tempo Médio</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100">{stats.avg_duration} <span className="text-xs text-slate-400 font-normal">ms</span></p>
          <span className="text-[10px] text-slate-500 block">Maior: {stats.max_duration}ms</span>
        </div>

        {/* Max Duration */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Maior Tempo</span>
            <Zap className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100">{stats.max_duration} <span className="text-xs text-slate-400 font-normal">ms</span></p>
          <span className="text-[10px] text-amber-500 block">Pico de latência</span>
        </div>

        {/* Avg Memory */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Memória Média</span>
            <HardDrive className="w-4 h-4 text-teal-500" />
          </div>
          <p className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100">{stats.avg_memory_mb} <span className="text-xs text-slate-400 font-normal">MB</span></p>
          <span className="text-[10px] text-slate-500 block">PHP RAM / Req</span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Realtime Request Throughput Chart */}
        <div className="lg:col-span-2 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Vazão de Requisições por Minuto</h3>
              <p className="text-xs text-slate-500">Fluxo de chamadas HTTP nos últimos 30 minutos</p>
            </div>
            <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono bg-emerald-500/10 text-emerald-500 rounded-full font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              LIVE
            </span>
          </div>
          <RequestsOverTimeChart data={stats.requests_per_minute} />
        </div>

        {/* Status Breakdown Pie Chart */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Distribuição de Status HTTP</h3>
            <p className="text-xs text-slate-500">Proporção 2xx, 3xx, 4xx e 5xx</p>
          </div>
          <StatusDistributionChart data={stats.status_breakdown} />
        </div>
      </div>

      {/* Top Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top URLs */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Top URLs Requisitadas</h3>
            <p className="text-xs text-slate-500">Rotas com maior volume de tráfego</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                  <th className="pb-2 font-medium">URL / Rota</th>
                  <th className="pb-2 font-medium text-right">Chamadas</th>
                  <th className="pb-2 font-medium text-right">Média</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {stats.top_urls.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-slate-400 font-sans italic">
                      Nenhuma requisição registrada ainda.
                    </td>
                  </tr>
                ) : (
                  stats.top_urls.map((u) => (
                    <tr key={u.url} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-2.5 font-semibold text-slate-800 dark:text-slate-200 truncate max-w-xs">{u.url}</td>
                      <td className="py-2.5 text-right font-bold text-indigo-500">{u.count}</td>
                      <td className="py-2.5 text-right text-slate-500">{u.avg_duration} ms</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Errors */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-rose-500">Top Erros Detectados</h3>
            <p className="text-xs text-slate-500">Exceções e falhas HTTP mais recorrentes</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                  <th className="pb-2 font-medium">Rota</th>
                  <th className="pb-2 font-medium text-center">Status</th>
                  <th className="pb-2 font-medium text-right">Ocorrências</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {stats.top_errors.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-slate-400 font-sans italic">
                      Nenhum erro registrado no sistema.
                    </td>
                  </tr>
                ) : (
                  stats.top_errors.map((err, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-2.5 font-semibold text-slate-800 dark:text-slate-200 truncate max-w-xs">
                        <div>{err.url}</div>
                        {err.exception && <div className="text-[10px] text-rose-400 truncate">{err.exception}</div>}
                      </td>
                      <td className="py-2.5 text-center">
                        <StatusBadge status={err.status} />
                      </td>
                      <td className="py-2.5 text-right font-bold text-rose-500">{err.count}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
