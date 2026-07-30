import React, { useState, useEffect } from 'react';
import { Filter, RotateCcw, Bookmark, Sparkles, Check, Trash2 } from 'lucide-react';
import { useLogStore } from '../stores/useLogStore';
import { Application, HttpMethod, RequestOrigin } from '../types';
import { api } from '../services/api';

export function Filters() {
  const { filters, setFilters, resetFilters, savedFilters, saveCurrentFilter, loadSavedFilter, removeSavedFilter } =
    useLogStore();
  const [applications, setApplications] = useState<Application[]>([]);
  const [saveName, setSaveName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);

  useEffect(() => {
    api.getApplications().then(setApplications).catch(console.error);
  }, []);

  const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];
  const origins: RequestOrigin[] = ['WEB', 'AJAX', 'CLI', 'QUEUE', 'CRON'];

  const handleSaveFilter = (e: React.FormEvent) => {
    e.preventDefault();
    if (saveName.trim()) {
      saveCurrentFilter(saveName.trim());
      setSaveName('');
      setShowSaveInput(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-4 shadow-sm transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
          <Filter className="w-4 h-4 text-indigo-500" />
          <span>Filtros de Pesquisa</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Saved filters dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
              <Bookmark className="w-3.5 h-3.5 text-indigo-500" />
              <span>Filtros Salvos</span>
            </button>

            <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-2 hidden group-hover:block z-20">
              <div className="px-3 py-1 text-[10px] font-bold uppercase text-slate-400">Favoritos</div>
              {savedFilters.map((sf) => (
                <div key={sf.id} className="flex items-center justify-between px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs">
                  <button
                    onClick={() => loadSavedFilter(sf)}
                    className="font-medium text-slate-800 dark:text-slate-200 hover:text-indigo-500 truncate"
                  >
                    {sf.name}
                  </button>
                  <button onClick={() => removeSavedFilter(sf.id)} className="text-slate-400 hover:text-rose-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1 px-2">
                {!showSaveInput ? (
                  <button
                    onClick={() => setShowSaveInput(true)}
                    className="w-full text-left px-2 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    Salvar Filtro Atual
                  </button>
                ) : (
                  <form onSubmit={handleSaveFilter} className="flex items-center gap-1 p-1">
                    <input
                      type="text"
                      placeholder="Nome do filtro..."
                      value={saveName}
                      onChange={(e) => setSaveName(e.target.value)}
                      className="w-full px-2 py-1 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:outline-none"
                    />
                    <button type="submit" className="p-1 bg-indigo-600 text-white rounded">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={resetFilters}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpar Filtros</span>
          </button>
        </div>
      </div>

      {/* Filter Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {/* Application Selector */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Aplicação</label>
          <select
            value={filters.application_id || ''}
            onChange={(e) => setFilters({ application_id: e.target.value })}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">Todas Aplicações</option>
            {applications.map((app) => (
              <option key={app.id} value={app.id}>
                {app.name} ({app.environment})
              </option>
            ))}
          </select>
        </div>

        {/* Method Selector */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Método HTTP</label>
          <select
            value={filters.method || ''}
            onChange={(e) => setFilters({ method: e.target.value })}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">Todos Métodos</option>
            {methods.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Status Group */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Status Code</label>
          <select
            value={filters.status_group || filters.status || ''}
            onChange={(e) => {
              const val = e.target.value;
              if (['2xx', '3xx', '4xx', '5xx'].includes(val)) {
                setFilters({ status_group: val as any, status: undefined });
              } else {
                setFilters({ status: val, status_group: undefined });
              }
            }}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">Todos Status</option>
            <option value="2xx">2xx (Sucesso)</option>
            <option value="3xx">3xx (Redirecionamento)</option>
            <option value="4xx">4xx (Erro Cliente)</option>
            <option value="5xx">5xx (Erro Servidor)</option>
            <option value="200">200 OK</option>
            <option value="401">401 Unauthorized</option>
            <option value="403">403 Forbidden</option>
            <option value="404">404 Not Found</option>
            <option value="500">500 Internal Error</option>
            <option value="504">504 Gateway Timeout</option>
          </select>
        </div>

        {/* Origin Selector */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Origem</label>
          <select
            value={filters.origin || ''}
            onChange={(e) => setFilters({ origin: e.target.value })}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">Todas Origens</option>
            {origins.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        {/* Min Duration */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Tempo Mínimo (ms)</label>
          <input
            type="number"
            placeholder="Ex: 300"
            value={filters.min_duration || ''}
            onChange={(e) => setFilters({ min_duration: e.target.value ? parseFloat(e.target.value) : undefined })}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>

        {/* User Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Usuário</label>
          <input
            type="text"
            placeholder="E-mail ou ID..."
            value={filters.user || ''}
            onChange={(e) => setFilters({ user: e.target.value })}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>
      </div>
    </div>
  );
}
