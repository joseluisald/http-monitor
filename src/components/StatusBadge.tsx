import React from 'react';

export function StatusBadge({ status }: { status: number }) {
  let bgClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  let dotClass = 'bg-emerald-400';

  if (status >= 200 && status < 300) {
    bgClass = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 dark:bg-emerald-500/20';
    dotClass = 'bg-emerald-400';
  } else if (status >= 300 && status < 400) {
    bgClass = 'bg-blue-500/15 text-blue-400 border-blue-500/30 dark:bg-blue-500/20';
    dotClass = 'bg-blue-400';
  } else if (status >= 400 && status < 500) {
    bgClass = 'bg-amber-500/15 text-amber-400 border-amber-500/30 dark:bg-amber-500/20';
    dotClass = 'bg-amber-400';
  } else if (status >= 500) {
    bgClass = 'bg-rose-500/15 text-rose-400 border-rose-500/30 dark:bg-rose-500/20';
    dotClass = 'bg-rose-400';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold border ${bgClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`}></span>
      {status}
    </span>
  );
}
