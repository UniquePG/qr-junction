'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Globe } from 'lucide-react';

interface CityData {
  name: string;
  country: string;
  value: number;
}

interface DashboardLocationsChartProps {
  cities: CityData[];
  totalScans: number;
}

const COLORS = ['#0046a1', '#001B50', '#f59e0b', '#10b981', '#ec4899'];

export default function DashboardLocationsChart({ cities, totalScans }: DashboardLocationsChartProps) {
  const chartData = cities.map((city, index) => ({
    name: city.name,
    value: city.value,
    color: COLORS[index % COLORS.length],
  }));

  const hasData = cities.length > 0;

  return (
    <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-6 shadow-xs flex flex-col h-full justify-between">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
        <Globe className="w-4.5 h-4.5 text-secondary" />
        <h3 className="text-sm font-bold text-[#001B50] uppercase tracking-wider">Top Scan Cities</h3>
      </div>

      {/* Graphical Circular View */}
      <div className="h-[180px] flex items-center justify-center relative">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '11px',
                }}
                formatter={(value: any) => [`${value} scans (${totalScans > 0 ? Math.round((Number(value) / totalScans) * 100) : 0}%)`]}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-slate-400 text-xs">No cities data logged.</div>
        )}
      </div>

      {/* Colored Circular Legend and Details list */}
      <div className="space-y-4 overflow-y-auto max-h-[190px] pr-1 flex-1 py-2">
        {cities.length === 0 ? (
          <div className="text-center text-slate-400 text-xs py-4">No cities to display.</div>
        ) : (
          cities.map((city, index) => {
            const color = COLORS[index % COLORS.length];
            const pct = totalScans > 0 ? Math.round((city.value / totalScans) * 100) : 0;
            return (
              <div key={index} className="space-y-1">
                {/* Header */}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-800 font-semibold flex items-center gap-2">
                    {/* Coloured circular badge matching the chart slice */}
                    <span 
                      className="w-2.5 h-2.5 rounded-full inline-block shrink-0" 
                      style={{ backgroundColor: color }}
                    />
                    {city.name}
                  </span>
                  <span className="text-slate-500 font-medium">{city.value} scans ({pct}%)</span>
                </div>

                <div className="text-[9px] text-slate-400 pl-4.5">
                  Country: <span className="text-slate-500">{city.country}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
