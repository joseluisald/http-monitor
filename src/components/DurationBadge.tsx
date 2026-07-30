import React from 'react';

export function DurationBadge({ duration }: { duration: number }) {
  let style = 'text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20';

  if (duration >= 300 && duration < 1000) {
    style = 'text-amber-500 dark:text-amber-400 bg-amber-500/10 border-amber-500/20';
  } else if (duration >= 1000) {
    style = 'text-rose-500 dark:text-rose-400 bg-rose-500/10 border-rose-500/20';
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono font-medium rounded border ${style}`}>
      {duration} ms
    </span>
  );
}
