import React from 'react';
import { RequestOrigin } from '../types';

export function OriginBadge({ origin }: { origin: RequestOrigin }) {
  let style = 'bg-slate-500/10 text-slate-400 border-slate-500/20';

  switch (origin) {
    case 'WEB':
      style = 'bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border-indigo-500/20';
      break;
    case 'AJAX':
      style = 'bg-teal-500/10 text-teal-500 dark:text-teal-400 border-teal-500/20';
      break;
    case 'CLI':
      style = 'bg-slate-500/10 text-slate-500 dark:text-slate-300 border-slate-500/20';
      break;
    case 'QUEUE':
      style = 'bg-orange-500/10 text-orange-500 dark:text-orange-400 border-orange-500/20';
      break;
    case 'CRON':
      style = 'bg-violet-500/10 text-violet-500 dark:text-violet-400 border-violet-500/20';
      break;
  }

  return (
    <span className={`inline-block px-2 py-0.5 text-[10px] font-mono font-medium rounded border ${style}`}>
      {origin}
    </span>
  );
}
