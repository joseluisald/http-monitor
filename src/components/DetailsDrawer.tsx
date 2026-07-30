import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, AlertTriangle, Cpu, Clock, Layers, FileCode, Server } from 'lucide-react';
import { useLogStore } from '../stores/useLogStore';
import { StatusBadge } from './StatusBadge';
import { MethodBadge } from './MethodBadge';
import { OriginBadge } from './OriginBadge';
import { DurationBadge } from './DurationBadge';
import { JsonViewer } from './JsonViewer';
import { Timeline } from './Timeline';

type TabType = 'resumo' | 'request' | 'response' | 'exception' | 'timeline' | 'machine';

export function DetailsDrawer() {
  const { selectedLog, isDrawerOpen, setDrawerOpen } = useLogStore();
  const [activeTab, setActiveTab] = useState<TabType>('resumo');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isDrawerOpen || !selectedLog) return null;

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'resumo', label: 'Resumo', icon: <Layers className="w-4 h-4" /> },
    { id: 'request', label: 'Request', icon: <FileCode className="w-4 h-4" /> },
    { id: 'response', label: 'Response', icon: <Server className="w-4 h-4" /> },
    {
      id: 'exception',
      label: 'Exception',
      icon: <AlertTriangle className="w-4 h-4" />,
      badge: selectedLog.exception ? '!' : undefined,
    },
    { id: 'timeline', label: 'Timeline', icon: <Clock className="w-4 h-4" /> },
    { id: 'machine', label: 'Máquina', icon: <Cpu className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm animate-fade-in flex justify-end">
      <div
        className="relative w-full max-w-4xl bg-[#111827] border-l border-slate-800 shadow-2xl flex flex-col h-full overflow-hidden transition-all duration-300"
        id="details-drawer"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0B1120]">
          <div className="flex items-center gap-3 overflow-hidden">
            <MethodBadge method={selectedLog.method} />
            <StatusBadge status={selectedLog.status} />
            <div className="truncate">
              <h3 className="text-sm font-mono font-bold text-slate-100 truncate" title={selectedLog.url}>
                {selectedLog.path || selectedLog.url}
              </h3>
              <p className="text-xs text-slate-400 font-mono">{selectedLog.host}</p>
            </div>
          </div>

          <button
            onClick={() => setDrawerOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Bar */}
        <div className="flex items-center gap-1 px-6 border-b border-slate-800 bg-[#0B1120] overflow-x-auto scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-mono font-semibold border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-indigo-400 text-indigo-400 bg-indigo-500/10 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="w-4 h-4 flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0F172A]/50">
          {/* TAB 1: RESUMO */}
          {activeTab === 'resumo' && (
            <div className="space-y-6">
              {/* Top Overview Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg border border-slate-800 bg-[#0B1120] shadow-sm">
                  <span className="text-[11px] font-medium text-slate-400 block font-mono uppercase tracking-wider">Aplicação</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: selectedLog.application_color || '#3b82f6' }}
                    ></span>
                    <span className="text-xs font-bold text-slate-100 truncate">
                      {selectedLog.application_name || 'Sistema'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-slate-800 bg-[#0B1120] shadow-sm">
                  <span className="text-[11px] font-medium text-slate-400 block font-mono uppercase tracking-wider">Duração Total</span>
                  <div className="mt-1">
                    <DurationBadge duration={selectedLog.total_time || selectedLog.duration} />
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-slate-800 bg-[#0B1120] shadow-sm">
                  <span className="text-[11px] font-medium text-slate-400 block font-mono uppercase tracking-wider">Origem</span>
                  <div className="mt-1">
                    <OriginBadge origin={selectedLog.origin} />
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-slate-800 bg-[#0B1120] shadow-sm">
                  <span className="text-[11px] font-medium text-slate-400 block font-mono uppercase tracking-wider">Usuário</span>
                  <span className="text-xs font-mono font-semibold text-slate-200 mt-1 block truncate">
                    {selectedLog.usuario_logado || 'Anônimo'}
                  </span>
                </div>
              </div>

              {/* General Details Table */}
              <div className="rounded-xl border border-slate-800 bg-[#0B1120] overflow-hidden shadow-sm">
                <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-800 text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                  Informações da Requisição
                </div>
                <div className="divide-y divide-slate-800 text-xs font-mono">
                  <div className="p-3 flex justify-between items-center">
                    <span className="text-slate-400 font-sans">URL Completa</span>
                    <div className="flex items-center gap-2 max-w-md">
                      <span className="truncate text-slate-200">{selectedLog.url}</span>
                      <button
                        onClick={() => copyToClipboard(selectedLog.url, 'url')}
                        className="text-slate-400 hover:text-slate-200"
                      >
                        {copiedField === 'url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="p-3 flex justify-between items-center">
                    <span className="text-slate-400 font-sans">Horário de Envio</span>
                    <span className="text-slate-200">
                      {new Date(selectedLog.created_at).toLocaleString('pt-BR')}
                    </span>
                  </div>

                  <div className="p-3 flex justify-between items-center">
                    <span className="text-slate-400 font-sans">IP Remoto</span>
                    <span className="text-slate-200">{selectedLog.remote_ip}</span>
                  </div>

                  <div className="p-3 flex justify-between items-center">
                    <span className="text-slate-400 font-sans">Request ID</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-200">{selectedLog.request_id}</span>
                      <button
                        onClick={() => copyToClipboard(selectedLog.request_id, 'reqid')}
                        className="text-slate-400 hover:text-slate-200"
                      >
                        {copiedField === 'reqid' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="p-3 flex justify-between items-center">
                    <span className="text-slate-400 font-sans">Trace ID</span>
                    <span className="text-slate-200">{selectedLog.trace_id}</span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {selectedLog.tags && selectedLog.tags.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-300 font-mono">Tags Associadas:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedLog.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 text-[11px] font-mono rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: REQUEST */}
          {activeTab === 'request' && (
            <div className="space-y-6">
              {/* Query Parameters */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Query Parameters
                </h4>
                <JsonViewer data={selectedLog.query} title="GET Query String" />
              </div>

              {/* Request Headers */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Request Headers
                </h4>
                <JsonViewer data={selectedLog.headers} title="HTTP Request Headers" />
              </div>

              {/* Request Body */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Request Body
                </h4>
                <JsonViewer data={selectedLog.request_body} title="Payload Enviado" />
              </div>
            </div>
          )}

          {/* TAB 3: RESPONSE */}
          {activeTab === 'response' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
                <StatusBadge status={selectedLog.status} />
                <span className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300">
                  Response HTTP Status Code
                </span>
              </div>

              {/* Response Headers */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Response Headers
                </h4>
                <JsonViewer data={selectedLog.response_headers || { 'Content-Type': 'application/json' }} title="HTTP Response Headers" />
              </div>

              {/* Response Body */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Response Body
                </h4>
                <JsonViewer data={selectedLog.response_body} title="Body Retornado pela Aplicação" />
              </div>
            </div>
          )}

          {/* TAB 4: EXCEPTION & STACK TRACE */}
          {activeTab === 'exception' && (
            <div className="space-y-6">
              {selectedLog.exception ? (
                <>
                  <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-rose-500 font-bold text-sm">
                      <AlertTriangle className="w-5 h-5" />
                      <span>Exceção Lançada:</span>
                    </div>
                    <p className="font-mono text-xs text-rose-300 break-all whitespace-pre-wrap font-semibold">
                      {selectedLog.exception}
                    </p>
                  </div>

                  {selectedLog.stack_trace && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          PHP Stack Trace
                        </h4>
                        <button
                          onClick={() => copyToClipboard(selectedLog.stack_trace!, 'stack')}
                          className="text-xs text-indigo-500 hover:underline flex items-center gap-1 font-mono"
                        >
                          {copiedField === 'stack' ? 'Copiado!' : 'Copiar Stack Trace'}
                        </button>
                      </div>
                      <pre className="p-4 bg-slate-900 border border-slate-800 text-rose-400 font-mono text-xs rounded-xl overflow-x-auto max-h-96 leading-relaxed">
                        {selectedLog.stack_trace}
                      </pre>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500">
                  <Check className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Nenhuma Exceção Ocorreu</p>
                  <p className="text-xs mt-1">Esta requisição foi concluída sem falhas não tratadas no servidor PHP.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: TIMELINE */}
          {activeTab === 'timeline' && <Timeline log={selectedLog} />}

          {/* TAB 6: MACHINE & CONTEXT INFO */}
          {activeTab === 'machine' && (
            <div className="space-y-4">
              <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-500" />
                  Ambiente de Execução PHP
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Uso de Memória</span>
                    <span className="text-slate-900 dark:text-slate-100 font-bold">
                      {((selectedLog.memory_usage || 0) / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Pico de Memória</span>
                    <span className="text-slate-900 dark:text-slate-100 font-bold">
                      {((selectedLog.peak_memory || 0) / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-800 col-span-2">
                    <span className="text-slate-500 block text-[10px]">User Agent</span>
                    <span className="text-slate-900 dark:text-slate-100 font-medium break-all">{selectedLog.user_agent}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
