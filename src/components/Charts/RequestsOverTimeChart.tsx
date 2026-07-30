import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface RequestsOverTimeChartProps {
  data: { timestamp: string; count: number; errors: number }[];
}

export function RequestsOverTimeChart({ data }: RequestsOverTimeChartProps) {
  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-slate-500 text-xs">Sem dados em tempo real</div>;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorErrors" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={11} tickLine={false} />
          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px', color: '#f8fafc' }}
          />
          <Area type="monotone" dataKey="count" name="Total Requests" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
          <Area type="monotone" dataKey="errors" name="Erros" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorErrors)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
