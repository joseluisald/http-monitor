import React from 'react';
import { HttpLog } from '../types';

interface TimelineProps {
  log: HttpLog;
}

export function Timeline({ log }: TimelineProps) {
  const dns = log.dns_time || 0;
  const tcp = log.connect_time || 0;
  const ssl = log.ssl_time || 0;
  const total = log.total_time || log.duration || 1;

  // Estimate send, wait, download if not broken down
  const send = Math.max(1, Math.round(total * 0.05));
  const wait = Math.max(1, total - (dns + tcp + ssl + send));
  const download = Math.max(1, Math.round(total * 0.05));

  const stages = [
    { name: 'DNS Lookup', value: dns, color: 'bg-amber-500', labelColor: 'text-amber-500' },
    { name: 'Initial Connection (TCP)', value: tcp, color: 'bg-orange-500', labelColor: 'text-orange-500' },
    { name: 'SSL / TLS Handshake', value: ssl, color: 'bg-purple-500', labelColor: 'text-purple-500' },
    { name: 'Request Sent (Sending)', value: send, color: 'bg-blue-500', labelColor: 'text-blue-500' },
    { name: 'Waiting (TTFB)', value: wait, color: 'bg-emerald-500', labelColor: 'text-emerald-500' },
    { name: 'Content Download', value: download, color: 'bg-teal-500', labelColor: 'text-teal-500' },
  ];

  return (
    <div className="space-y-4 p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h4 className="text-sm font-semibold text-slate-200">Network Timing Waterfall</h4>
          <p className="text-xs text-slate-400">Estilo Chrome DevTools Timing</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400">Tempo Total</span>
          <p className="text-lg font-mono font-bold text-emerald-400">{total} ms</p>
        </div>
      </div>

      {/* Waterfall visual stacked bar */}
      <div className="space-y-3">
        {stages.map((stage) => {
          const percentage = Math.max(1, Math.min(100, (stage.value / total) * 100));

          return (
            <div key={stage.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">{stage.name}</span>
                <span className={`font-mono font-bold ${stage.labelColor}`}>{stage.value} ms</span>
              </div>
              <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  className={`h-full ${stage.color} rounded-full transition-all duration-300`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cumulative timing summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-xs font-mono">
        <div className="p-2 bg-slate-950 rounded border border-slate-800">
          <span className="text-slate-500 block text-[10px]">Memória Alocada</span>
          <span className="text-slate-200 font-bold">
            {((log.memory_usage || 0) / (1024 * 1024)).toFixed(2)} MB
          </span>
        </div>
        <div className="p-2 bg-slate-950 rounded border border-slate-800">
          <span className="text-slate-500 block text-[10px]">Pico de Memória</span>
          <span className="text-slate-200 font-bold">
            {((log.peak_memory || 0) / (1024 * 1024)).toFixed(2)} MB
          </span>
        </div>
        <div className="p-2 bg-slate-950 rounded border border-slate-800">
          <span className="text-slate-500 block text-[10px]">Latência Rede</span>
          <span className="text-slate-200 font-bold">{dns + tcp + ssl} ms</span>
        </div>
      </div>
    </div>
  );
}
