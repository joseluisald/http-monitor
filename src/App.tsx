/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, PageView } from './components/Sidebar';
import { DetailsDrawer } from './components/DetailsDrawer';
import { CodeSnippetModal } from './components/CodeSnippetModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { DashboardPage } from './pages/DashboardPage';
import { LogsPage } from './pages/LogsPage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AlertsPage } from './pages/AlertsPage';
import { useLogStore } from './stores/useLogStore';
import { useThemeStore } from './stores/useThemeStore';
import { subscribeToLogs, subscribeToAlerts } from './services/socket';
import { TriggeredAlert } from './types';
import { Bell, X } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<PageView>('dashboard');
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);
  const [activeSnippetToken, setActiveSnippetToken] = useState<string | undefined>();
  const [activeToasts, setActiveToasts] = useState<TriggeredAlert[]>([]);

  const { addIncomingLog, fetchLogs, toggleLiveMode, isDrawerOpen, setDrawerOpen } = useLogStore();
  const { darkMode, toggleDarkMode } = useThemeStore();

  // Initialize theme class on mount
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Socket.IO Realtime subscriptions
  useEffect(() => {
    const unsubscribeLogs = subscribeToLogs((newLog) => {
      addIncomingLog(newLog);
    });

    const unsubscribeAlerts = subscribeToAlerts((alert) => {
      setActiveToasts((prev) => [alert, ...prev.slice(0, 4)]);
    });

    return () => {
      unsubscribeLogs();
      unsubscribeAlerts();
    };
  }, [addIncomingLog]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore inside text inputs
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        if (e.key === 'Escape') {
          (e.target as HTMLElement).blur();
        }
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        const searchEl = document.getElementById('global-search-input');
        if (searchEl) searchEl.focus();
      } else if (e.key.toLowerCase() === 'l') {
        toggleLiveMode();
      } else if (e.key.toLowerCase() === 'd') {
        toggleDarkMode();
      } else if (e.key.toLowerCase() === 'r') {
        fetchLogs();
      } else if (e.key === 'Escape') {
        setDrawerOpen(false);
        setCodeModalOpen(false);
        setShortcutsModalOpen(false);
      } else if (e.key === '1') {
        setCurrentView('dashboard');
      } else if (e.key === '2') {
        setCurrentView('logs');
      } else if (e.key === '3') {
        setCurrentView('applications');
      } else if (e.key === '4') {
        setCurrentView('analytics');
      } else if (e.key === '5') {
        setCurrentView('alerts');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleLiveMode, toggleDarkMode, fetchLogs, setDrawerOpen]);

  const handleOpenCodeModalWithToken = (token?: string) => {
    setActiveSnippetToken(token);
    setCodeModalOpen(true);
  };

  const removeToast = (id: string) => {
    setActiveToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 font-sans flex flex-col transition-colors selection:bg-indigo-500 selection:text-white antialiased">
      {/* Top Navbar */}
      <Navbar
        onOpenCodeModal={() => handleOpenCodeModalWithToken()}
        onOpenShortcutsModal={() => setShortcutsModalOpen(true)}
      />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden w-full mx-auto">
        {/* Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={setCurrentView}
          activeAlertsCount={activeToasts.length}
        />

        {/* Page Views Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[#0F172A]">
          {currentView === 'dashboard' && <DashboardPage onNavigateToLogs={() => setCurrentView('logs')} />}
          {currentView === 'logs' && <LogsPage />}
          {currentView === 'applications' && (
            <ApplicationsPage onOpenCodeModal={(tok) => handleOpenCodeModalWithToken(tok)} />
          )}
          {currentView === 'analytics' && <AnalyticsPage />}
          {currentView === 'alerts' && <AlertsPage />}
        </main>
      </div>

      {/* Footer Status Bar - Technical Dashboard Theme */}
      <footer className="h-8 border-t border-slate-800 bg-[#0B1120] px-6 flex items-center justify-between text-[11px] text-slate-400 font-mono select-none shrink-0 z-30">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-slate-300">SYSTEM OPERATIONAL</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-slate-500">
            <span>•</span>
            <span>WEBSOCKET: <strong className="text-emerald-400">LIVE</strong></span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-slate-500">
            <span>•</span>
            <span>PHP TELEMETRY ENGINE</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-slate-500">
          <span className="hidden sm:inline">TELESCOPE PROTOCOL v2.4</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold text-[10px]">v2.4.0-stable</span>
        </div>
      </footer>

      {/* Slide-over Side Panel Details Drawer */}
      <DetailsDrawer />

      {/* Modals */}
      <CodeSnippetModal
        isOpen={codeModalOpen}
        onClose={() => setCodeModalOpen(false)}
        token={activeSnippetToken}
      />

      <KeyboardShortcutsModal
        isOpen={shortcutsModalOpen}
        onClose={() => setShortcutsModalOpen(false)}
      />

      {/* Realtime Toast Notifications for Triggered Alerts */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none">
        {activeToasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto p-4 rounded-xl bg-rose-950 text-rose-100 border border-rose-800 shadow-2xl flex items-start justify-between gap-3 animate-slide-up"
          >
            <div className="flex items-start gap-2.5">
              <Bell className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-bounce" />
              <div>
                <h4 className="text-xs font-bold font-mono text-white">{toast.rule_name}</h4>
                <p className="text-xs text-rose-200 mt-0.5">{toast.message}</p>
              </div>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 text-rose-400 hover:text-white rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
