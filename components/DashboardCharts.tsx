'use client';

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { BarChart3, Smartphone, Compass, Target } from 'lucide-react';

interface DashboardChartsProps {
  stats: {
    trends: Array<{ date: string; scans: number }>;
    devices: { MOBILE: number; DESKTOP: number; TABLET: number; UNKNOWN: number };
    browsers: Array<{ name: string; value: number }>;
    os: Array<{ name: string; value: number }>;
    campaigns: Array<{ name: string; value: number }>;
  };
}

export default function DashboardCharts({ stats }: DashboardChartsProps) {
  // Convert device stats for Recharts Pie Chart
  const totalDeviceScans = Object.values(stats.devices).reduce((a, b) => a + b, 0) || 1;
  const devicePieData = [
    { name: 'Mobile', value: stats.devices.MOBILE || 0, color: '#0046a1' },
    { name: 'Desktop', value: stats.devices.DESKTOP || 0, color: '#001B50' },
    { name: 'Tablet', value: stats.devices.TABLET || 0, color: '#f59e0b' },
    { name: 'Unknown', value: stats.devices.UNKNOWN || 0, color: '#94a3b8' }
  ].filter(item => item.value > 0);

  // Fallback if no device scans are recorded
  const hasDeviceData = devicePieData.length > 0;

  // OS & Browser Chart Data
  const osData = stats.os.slice(0, 4);
  const browserData = stats.browsers.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Trends Graph */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs space-y-4 flex flex-col justify-between">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
          <BarChart3 className="w-4.5 h-4.5 text-primary" />
          <h3 className="text-sm font-bold text-[#001B50] uppercase tracking-wider">Scan Traffic Trend</h3>
        </div>

        <div className="w-full h-[260px] pt-4">
          {stats.trends.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={stats.trends}
                margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0046a1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0046a1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '12px',
                    fontSize: '11px' 
                  }}
                  labelClassName="text-slate-500 font-bold"
                  itemStyle={{ color: '#0046a1', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="scans" 
                  name="Scans"
                  stroke="#0046a1" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#colorScans)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-50/50 rounded-xl border border-slate-100">
              <p className="text-slate-400 text-xs">No scan trend data for this period.</p>
            </div>
          )}
        </div>
      </div>

      {/* Grid of detailed breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Device Distribution (Doughnut Chart) */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <Smartphone className="w-4.5 h-4.5 text-[#0046a1]" />
            <h3 className="text-sm font-bold text-[#001B50] uppercase tracking-wider">Device Distribution</h3>
          </div>

          <div className="h-[200px] flex items-center justify-center relative">
            {hasDeviceData ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={devicePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {devicePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '8px',
                      fontSize: '11px' 
                    }}
                    formatter={(value: any) => [`${value} scans (${Math.round((Number(value) / totalDeviceScans) * 100)}%)`]}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconSize={8}
                    iconType="circle"
                    wrapperStyle={{ fontSize: '10px', marginTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">No device data available.</div>
            )}
          </div>
        </div>

        {/* Operating Systems & Browsers Breakdown */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <Compass className="w-4.5 h-4.5 text-[#10B981]" />
            <h3 className="text-sm font-bold text-[#001B50] uppercase tracking-wider">OS & Browsers</h3>
          </div>

          <div className="space-y-4 flex-1 justify-center flex flex-col">
            {/* Top Operating Systems */}
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Top OS</span>
              {osData.length === 0 ? (
                <span className="text-slate-400 text-xs">No OS logs recorded</span>
              ) : (
                osData.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">{item.name}</span>
                    <span className="font-semibold text-slate-700 bg-slate-50 px-2.5 py-0.5 rounded border border-slate-200">{item.value} scans</span>
                  </div>
                ))
              )}
            </div>

            {/* Top Browsers */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Top Browsers</span>
              {browserData.length === 0 ? (
                <span className="text-slate-400 text-xs">No browser logs recorded</span>
              ) : (
                browserData.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">{item.name}</span>
                    <span className="font-semibold text-slate-700 bg-slate-50 px-2.5 py-0.5 rounded border border-slate-200">{item.value} scans</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Campaign UTM Breakdown (Bar Chart) */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <Target className="w-4.5 h-4.5 text-primary" />
            <h3 className="text-sm font-bold text-[#001B50] uppercase tracking-wider">UTM Campaigns</h3>
          </div>

          <div className="h-[200px] pt-2">
            {stats.campaigns.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.campaigns.slice(0, 4)}
                  layout="vertical"
                  margin={{ top: 5, right: 10, left: -25, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={9} />
                  <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={9} width={80} />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '8px',
                      fontSize: '11px' 
                    }}
                  />
                  <Bar dataKey="value" name="Scans" fill="#0046a1" radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">No campaign data logged.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
