import React from 'react';
import { X, Command } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '/', description: 'Focar na barra de busca global' },
    { key: 'L', description: 'Alternar modo LIVE (WebSockets)' },
    { key: 'D', description: 'Alternar modo Claro / Escuro' },
    { key: 'R', description: 'Atualizar lista de requisições' },
    { key: 'Esc', description: 'Fechar gaveta lateral ou modal' },
    { key: '1', description: 'Ir para Dashboard' },
    { key: '2', description: 'Ir para Requisições HTTP' },
    { key: '3', description: 'Ir para Aplicações' },
    { key: '4', description: 'Ir para Estatísticas' },
    { key: '5', description: 'Ir para Alertas' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-sm">
            <Command className="w-4 h-4 text-indigo-500" />
            <span>Atalhos do Teclado</span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          {shortcuts.map((sc) => (
            <div key={sc.key} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950 text-xs">
              <span className="text-slate-600 dark:text-slate-400">{sc.description}</span>
              <kbd className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-800 dark:text-slate-200 rounded shadow-xs">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
