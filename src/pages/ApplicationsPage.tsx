import React, { useState, useEffect } from 'react';
import {
  Grid,
  Plus,
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Application } from '../types';
import { api } from '../services/api';

interface ApplicationsPageProps {
  onOpenCodeModal: (token?: string) => void;
}

export function ApplicationsPage({ onOpenCodeModal }: ApplicationsPageProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [name, setName] = useState('');
  const [environment, setEnvironment] = useState('production');
  const [color, setColor] = useState('#3b82f6');

  const [visibleTokens, setVisibleTokens] = useState<Record<string, boolean>>({});
  const [copiedTokens, setCopiedTokens] = useState<Record<string, boolean>>({});

  const loadApplications = async () => {
    try {
      const data = await api.getApplications();
      setApplications(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await api.createApplication({ name, environment, color });
      setName('');
      setShowCreateModal(false);
      loadApplications();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja remover esta aplicação do monitor?')) {
      try {
        await api.deleteApplication(id);
        loadApplications();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const toggleTokenVisibility = (id: string) => {
    setVisibleTokens((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToken = (token: string, id: string) => {
    navigator.clipboard.writeText(token);
    setCopiedTokens((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopiedTokens((prev) => ({ ...prev, [id]: false }));
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Grid className="w-5 h-5 text-indigo-500" />
            <span>Aplicações Monitoradas</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Gerencie os tokens Bearer de suas aplicações PHP e sistemas web</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Aplicação</span>
        </button>
      </div>

      {/* Grid of App Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-slate-400">Carregando aplicações...</div>
        ) : applications.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">Nenhuma aplicação cadastrada ainda.</div>
        ) : (
          applications.map((app) => (
            <div
              key={app.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: app.color }}
                    ></div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{app.name}</h3>
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                        {app.environment}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {app.active ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> ATIVO
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-500/10 px-2 py-0.5 rounded-full">
                        <XCircle className="w-3 h-3" /> INATIVO
                      </span>
                    )}
                  </div>
                </div>

                {/* Token Box */}
                <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Key className="w-3 h-3 text-indigo-500" />
                    Bearer Token
                  </span>
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="text-slate-800 dark:text-slate-200 truncate pr-2">
                      {visibleTokens[app.id] ? app.token : '••••••••••••••••••••••••'}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => toggleTokenVisibility(app.id)}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        title="Revelar Token"
                      >
                        {visibleTokens[app.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => copyToken(app.token, app.id)}
                        className="p-1 text-slate-400 hover:text-indigo-500"
                        title="Copiar Token"
                      >
                        {copiedTokens[app.id] ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <button
                  onClick={() => onOpenCodeModal(app.token)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  Ver Instruções PHP &rarr;
                </button>

                <button
                  onClick={() => handleDelete(app.id)}
                  className="text-slate-400 hover:text-rose-500 p-1"
                  title="Excluir Aplicação"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Application Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Cadastrar Nova Aplicação</h3>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome do Sistema</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Sistema Comercial ERP"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Ambiente</label>
                <select
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="production">Production</option>
                  <option value="staging">Staging</option>
                  <option value="development">Development</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Cor do Badge</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-9 h-9 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <span className="font-mono text-xs text-slate-500">{color}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md"
                >
                  Gerar Token e Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
