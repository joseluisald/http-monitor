import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TopEntitiesChartProps {
  data: { url: string; count: number; avg_duration: number }[];
}

export function TopEntitiesChart({ data }: TopEntitiesChartProps) {
  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-slate-500 text-xs">Sem dados</div>;
  }

  const formattedData = data.slice(0, 6).map((item) => ({
    name: item.url.length > 25 ? item.url.substring(0, 25) + '...' : item.url,
    fullUrl: item.url,
    Requests: item.count,
    Latency: item.avg_duration,
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formattedData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis type="number" stroke="#94a3b8" fontSize={11} />
          <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={130} tickLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px', color: '#f8fafc' }}
          />
          <Bar dataKey="Requests" fill="#6366f1" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
