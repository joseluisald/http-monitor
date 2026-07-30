import React, { useState } from 'react';
import { Copy, Check, Search } from 'lucide-react';

interface JsonViewerProps {
  data: any;
  title?: string;
}

export function JsonViewer({ data, title }: JsonViewerProps) {
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  if (data === null || data === undefined) {
    return (
      <div className="p-4 text-xs font-mono text-slate-400 dark:text-slate-500 italic bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800">
        Nenhum dado enviado (Body vazio / null)
      </div>
    );
  }

  const jsonString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Basic syntax highlighter for JSON
  const renderHighlightedJson = (text: string) => {
    if (!text) return '';

    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const isMatch = searchTerm && line.toLowerCase().includes(searchTerm.toLowerCase());

      // Simple regex based color replacement
      const highlightedLine = line
        .replace(/"([^"]+)":/g, '<span class="text-indigo-600 dark:text-indigo-400 font-semibold">"$1"</span>:')
        .replace(/: "([^"]+)"/g, ': <span class="text-emerald-600 dark:text-emerald-400">"$1"</span>')
        .replace(/: (true|false)/g, ': <span class="text-amber-600 dark:text-amber-400 font-bold">$1</span>')
        .replace(/: (null)/g, ': <span class="text-rose-500 font-bold">$1</span>')
        .replace(/: (-?\d+\.?\d*)/g, ': <span class="text-sky-600 dark:text-sky-400">$1</span>');

      return (
        <div
          key={idx}
          className={`table-row text-xs font-mono leading-relaxed ${
            isMatch ? 'bg-amber-500/20 dark:bg-amber-500/30 font-bold' : 'hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
          }`}
        >
          <span className="table-cell text-right pr-4 select-none text-slate-400 dark:text-slate-600 w-10 text-[11px]">
            {idx + 1}
          </span>
          <span
            className="table-cell whitespace-pre text-slate-800 dark:text-slate-200"
            dangerouslySetInnerHTML={{ __html: highlightedLine }}
          />
        </div>
      );
    });
  };

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 overflow-hidden shadow-sm">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-950 border-b border-slate-800 text-xs">
        <span className="font-mono text-slate-400 font-medium">{title || 'JSON Payload'}</span>
        <div className="flex items-center gap-2">
          {/* Quick Search */}
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar no JSON..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-7 pr-2 py-0.5 text-[11px] bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-indigo-500 w-32 focus:w-44 transition-all"
            />
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-colors font-medium"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code body */}
      <div className="p-3 overflow-x-auto max-h-[400px] overflow-y-auto font-mono text-xs">
        <div className="table w-full">{renderHighlightedJson(jsonString)}</div>
      </div>
    </div>
  );
}
