import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface StatusDistributionChartProps {
  data: { status_group: string; count: number; color: string }[];
}

export function StatusDistributionChart({ data }: StatusDistributionChartProps) {
  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-slate-500 text-xs">Sem dados</div>;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={4}
            dataKey="count"
            nameKey="status_group"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px', color: '#f8fafc' }}
          />
          <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
