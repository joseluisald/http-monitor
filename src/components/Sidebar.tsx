import React from 'react';
import {
  LayoutDashboard,
  ListFilter,
  Grid,
  BarChart3,
  Bell,
  Code2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export type PageView = 'dashboard' | 'logs' | 'applications' | 'analytics' | 'alerts';

interface SidebarProps {
  currentView: PageView;
  onNavigate: (view: PageView) => void;
  activeAlertsCount?: number;
}

export function Sidebar({ currentView, onNavigate, activeAlertsCount = 0 }: SidebarProps) {
  const navItems: { id: PageView; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'logs', label: 'Requisições HTTP', icon: <ListFilter className="w-4 h-4" /> },
    { id: 'applications', label: 'Aplicações', icon: <Grid className="w-4 h-4" /> },
    { id: 'analytics', label: 'Estatísticas', icon: <BarChart3 className="w-4 h-4" /> },
    {
      id: 'alerts',
      label: 'Alertas',
      icon: <Bell className="w-4 h-4" />,
      badge: activeAlertsCount > 0 ? activeAlertsCount : undefined,
    },
  ];

  return (
    <aside className="w-64 bg-[#0B1120] border-r border-slate-800 flex flex-col justify-between py-4 px-3 select-none shrink-0 transition-colors">
      <div className="space-y-6">
        {/* Navigation Group */}
        <div className="space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">
            Navegação Principal
          </div>
          {navItems.map((item) => {
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-all ${
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/20 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                      isActive ? 'bg-indigo-500 text-white' : 'bg-rose-500 text-white animate-pulse'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Info Box */}
      <div className="p-3 bg-[#0F172A]/80 rounded-lg border border-slate-800 space-y-2">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Telemetria Ativa</span>
        </div>
        <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
          Monitorando conexões HTTP via WebSocket em tempo real.
        </p>
      </div>
    </aside>
  );
}
