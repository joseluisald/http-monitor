import React, { useState } from 'react';
import {
  Activity,
  Search,
  Moon,
  Sun,
  Code,
  HelpCircle,
  Radio,
  RefreshCw,
} from 'lucide-react';
import { useLogStore } from '../stores/useLogStore';
import { useThemeStore } from '../stores/useThemeStore';

interface NavbarProps {
  onOpenCodeModal: () => void;
  onOpenShortcutsModal: () => void;
}

export function Navbar({ onOpenCodeModal, onOpenShortcutsModal }: NavbarProps) {
  const { liveMode, toggleLiveMode, filters, setFilters, fetchLogs } = useLogStore();
  const { darkMode, toggleDarkMode } = useThemeStore();
  const [searchInput, setSearchInput] = useState(filters.query_text || '');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ query_text: searchInput });
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#0F172A] border-b border-slate-800 transition-colors">
      <div className="h-full w-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 shrink-0">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-white tracking-tight text-base font-sans">
                HTTP Monitor
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                TELESCOPE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium font-mono">PHP Request Telemetry Engine</p>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            id="global-search-input"
            placeholder="Pesquisar URL, IP, usuário, status, tag... (Pressione / )"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-[#0B1120] border border-slate-800 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 rounded border border-slate-700">
            /
          </kbd>
        </form>

        {/* Right Actions Bar */}
        <div className="flex items-center gap-2">
          {/* Live Mode Toggle Button */}
          <button
            onClick={toggleLiveMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-lg border transition-all ${
              liveMode
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-800/80 text-slate-400 border-slate-700'
            }`}
            title="Ativar/Desativar recepção em tempo real via WebSockets"
          >
            <Radio className={`w-3.5 h-3.5 ${liveMode ? 'animate-pulse text-emerald-400' : ''}`} />
            <span>LIVE</span>
            <span className={`w-2 h-2 rounded-full ${liveMode ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`}></span>
          </button>

          {/* Manual Refresh Button */}
          <button
            onClick={() => fetchLogs()}
            className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
            title="Atualizar lista (R)"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Code Snippets Button */}
          <button
            onClick={onOpenCodeModal}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Código de integração PHP / Client SDK"
          >
            <Code className="w-4 h-4" />
          </button>

          {/* Shortcuts Button */}
          <button
            onClick={onOpenShortcutsModal}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Atalhos de teclado"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
            title="Alternar tema Claro / Escuro (D)"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
