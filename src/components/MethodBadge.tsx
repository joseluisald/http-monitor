import React from 'react';
import { HttpMethod } from '../types';

export function MethodBadge({ method }: { method: HttpMethod }) {
  let style = 'bg-slate-500/10 text-slate-400 border-slate-500/20';

  switch (method) {
    case 'GET':
      style = 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/20';
      break;
    case 'POST':
      style = 'bg-blue-500/10 text-blue-500 dark:text-blue-400 border-blue-500/20';
      break;
    case 'PUT':
      style = 'bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/20';
      break;
    case 'PATCH':
      style = 'bg-purple-500/10 text-purple-500 dark:text-purple-400 border-purple-500/20';
      break;
    case 'DELETE':
      style = 'bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/20';
      break;
    case 'OPTIONS':
    case 'HEAD':
      style = 'bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 border-cyan-500/20';
      break;
  }

  return (
    <span className={`inline-block px-2 py-0.5 text-[11px] font-mono font-bold rounded border ${style}`}>
      {method}
    </span>
  );
}
