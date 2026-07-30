import React, { useEffect, useState } from 'react';
import { BarChart3, Activity, Clock, Zap, TrendingUp, Users, Server } from 'lucide-react';
import { DashboardStats } from '../types';
import { api } from '../services/api';
import { RequestsOverTimeChart } from '../components/Charts/RequestsOverTimeChart';
import { StatusDistributionChart } from '../components/Charts/StatusDistributionChart';
import { TopEntitiesChart } from '../components/Charts/TopEntitiesChart';

export function AnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getStats().then((data) => {
      setStats(data);
      setIsLoading(false);
    }).catch(console.error);
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <Activity className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-500" />
          <span>Estatísticas & Métricas de Desempenho</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Visão analítica profunda das requisições HTTP e throughput da aplicação</p>
      </div>

      {/* Grid of Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Requisições em Tempo Real (Minuto a Minuto)</h3>
          <RequestsOverTimeChart data={stats.requests_per_minute} />
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Distribuição de Status Codes</h3>
          <StatusDistributionChart data={stats.status_breakdown} />
        </div>
      </div>

      {/* Top URLs Chart */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Top Rotas / Endpoints com Maior Volume</h3>
        <TopEntitiesChart data={stats.top_urls} />
      </div>

      {/* Top Hosts & Top Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Server className="w-4 h-4 text-indigo-500" />
            Top Hosts Origem
          </h3>
          <div className="space-y-2 text-xs font-mono">
            {stats.top_hosts.map((h) => (
              <div key={h.host} className="flex justify-between p-2 rounded bg-slate-50 dark:bg-slate-950">
                <span className="text-slate-800 dark:text-slate-200 font-semibold">{h.host}</span>
                <span className="text-indigo-500 font-bold">{h.count} reqs</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-500" />
            Top Usuários Logados
          </h3>
          <div className="space-y-2 text-xs font-mono">
            {stats.top_users.map((u) => (
              <div key={u.user} className="flex justify-between p-2 rounded bg-slate-50 dark:bg-slate-950">
                <span className="text-slate-800 dark:text-slate-200 font-semibold">{u.user}</span>
                <span className="text-emerald-500 font-bold">{u.count} reqs</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
