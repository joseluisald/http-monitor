import React, { useEffect } from 'react';
import {
  Download,
  FileSpreadsheet,
  FileJson,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Search,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useLogStore } from '../stores/useLogStore';
import { StatusBadge } from '../components/StatusBadge';
import { MethodBadge } from '../components/MethodBadge';
import { OriginBadge } from '../components/OriginBadge';
import { DurationBadge } from '../components/DurationBadge';
import { Filters } from '../components/Filters';
import { HttpLog } from '../types';

export function LogsPage() {
  const {
    logs,
    totalLogs,
    totalPages,
    currentPage,
    isLoading,
    filters,
    setFilters,
    fetchLogs,
    setSelectedLog,
  } = useLogStore();

  useEffect(() => {
    fetchLogs();
  }, []);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setFilters({ page: newPage });
    }
  };

  const handleSort = (field: string) => {
    const isSameField = filters.sort_by === field;
    const newOrder = isSameField && filters.sort_order === 'desc' ? 'asc' : 'desc';
    setFilters({ sort_by: field, sort_order: newOrder });
  };

  const handleExportCsv = () => {
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== '') query.append(k, String(v));
    });
    window.open(`/api/export/csv?${query.toString()}`, '_blank');
  };

  const handleExportJson = () => {
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== '') query.append(k, String(v));
    });
    window.open(`/api/export/json?${query.toString()}`, '_blank');
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header with Export Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-500" />
            <span>Logs de Requisições HTTP</span>
          </h2>
          <p className="text-xs text-slate-500">Exibindo {totalLogs} registros monitorados no sistema</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors shadow-xs"
          >
            <FileJson className="w-4 h-4 text-amber-500" />
            <span>Exportar JSON</span>
          </button>
        </div>
      </div>

      {/* Filter Component */}
      <Filters />

      {/* Main HTTP Requests Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 select-none">
                <th
                  onClick={() => handleSort('created_at')}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Hora</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold whitespace-nowrap">Aplicação</th>
                <th className="py-3 px-4 font-semibold whitespace-nowrap">Método</th>
                <th
                  onClick={() => handleSort('status')}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('total_time')}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Tempo</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold whitespace-nowrap min-w-[280px]">URL / Rota</th>
                <th className="py-3 px-4 font-semibold whitespace-nowrap">Origem</th>
                <th className="py-3 px-4 font-semibold whitespace-nowrap">Usuário</th>
                <th className="py-3 px-4 font-semibold whitespace-nowrap">IP Remoto</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Sparkles className="w-6 h-6 text-indigo-500 animate-spin" />
                      <span>Buscando requisições HTTP...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Nenhum log encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                logs.map((log: HttpLog) => (
                  <tr
                    key={log.uuid}
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors group"
                  >
                    {/* Hora */}
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleTimeString('pt-BR')}
                    </td>

                    {/* Aplicação */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: log.application_color || '#3b82f6' }}
                        ></span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 font-sans truncate max-w-[120px]">
                          {log.application_name || 'App'}
                        </span>
                      </div>
                    </td>

                    {/* Método */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <MethodBadge method={log.method} />
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={log.status} />
                    </td>

                    {/* Tempo */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <DurationBadge duration={log.total_time || log.duration} />
                    </td>

                    {/* URL */}
                    <td className="py-3 px-4 max-w-sm truncate text-slate-900 dark:text-slate-100 font-bold group-hover:text-indigo-500 transition-colors">
                      <div className="truncate" title={log.url}>
                        {log.path || log.url}
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal truncate">{log.host}</div>
                    </td>

                    {/* Origem */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <OriginBadge origin={log.origin} />
                    </td>

                    {/* Usuário */}
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                      {log.usuario_logado ? (
                        <span className="truncate max-w-[130px] inline-block" title={log.usuario_logado}>
                          {log.usuario_logado}
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-600 italic">Anônimo</span>
                      )}
                    </td>

                    {/* IP */}
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500 dark:text-slate-400">{log.remote_ip}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Server-Side Pagination Footer */}
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-xs font-mono">
          <div className="text-slate-500">
            Página <span className="font-bold text-slate-800 dark:text-slate-200">{currentPage}</span> de{' '}
            <span className="font-bold text-slate-800 dark:text-slate-200">{totalPages}</span> ({totalLogs} total)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
