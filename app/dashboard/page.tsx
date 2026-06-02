'use client';

import React, { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/components/AuthContext';
import { 
  TrendingUp, 
  QrCode, 
  Users, 
  Target, 
  BarChart3, 
  Smartphone, 
  Globe, 
  Compass, 
  Loader2 
} from 'lucide-react';
import { toast } from 'react-toastify';

interface DashboardStats {
  totalQRs: number;
  totalScans: number;
  uniqueScans: number;
  totalLeads: number;
  totalConversions: number;
  conversionRate: number;
  trends: Array<{ date: string; scans: number }>;
  devices: { MOBILE: number; DESKTOP: number; TABLET: number; UNKNOWN: number };
  browsers: Array<{ name: string; value: number }>;
  os: Array<{ name: string; value: number }>;
  locations: Array<{ country: string; scans: number; topCities: Array<{ name: string; value: number }> }>;
  campaigns: Array<{ name: string; value: number }>;
}

export default function DashboardOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        
        const token = await currentUser.getIdToken();
        const res = await fetch('/api/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Failed to load dashboard statistics.');
        const data = await res.json();
        setStats(data.stats);
      } catch (error: any) {
        console.error('Stats fetch error:', error);
        toast.error('Could not load statistics. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-slate-400 text-sm">Compiling scan analytics...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Failed to fetch overview metrics. Try refreshing.</p>
      </div>
    );
  }

  // Calculate device percentages for display
  const totalDeviceScans = Object.values(stats.devices).reduce((a, b) => a + b, 0) || 1;
  const devMobilePct = Math.round((stats.devices.MOBILE / totalDeviceScans) * 100);
  const devDesktopPct = Math.round((stats.devices.DESKTOP / totalDeviceScans) * 100);
  const devTabletPct = Math.round((stats.devices.TABLET / totalDeviceScans) * 100);

  // SVG Area Chart drawing calculations
  const maxScanValue = Math.max(...stats.trends.map((t) => t.scans), 5);
  const chartHeight = 160;
  const chartWidth = 500;
  const padding = 20;

  // Compile points string
  const points = stats.trends.map((t, idx) => {
    const x = padding + (idx * (chartWidth - padding * 2)) / (stats.trends.length - 1 || 1);
    const y = chartHeight - padding - (t.scans * (chartHeight - padding * 2)) / maxScanValue;
    return `${x},${y}`;
  });

  const pointsStr = points.join(' ');
  const firstPointX = padding;
  const lastPointX = chartWidth - padding;
  const bottomY = chartHeight - padding;
  const areaPointsStr = `${firstPointX},${bottomY} ${pointsStr} ${lastPointX},${bottomY}`;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Welcome Title */}
      <div>
        <h2 className="text-2xl font-bold text-white">Hello, {user?.displayName || 'Creator'} 👋</h2>
        <p className="text-slate-400 text-sm mt-1">Here is how your QR codes and campaigns are performing today.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Scans Card */}
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex items-center justify-between hover:border-primary/40 transition-all group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
          <div className="space-y-1">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Scans</span>
            <p className="text-3xl font-extrabold text-white group-hover:scale-105 transition-transform origin-left">{stats.totalScans}</p>
            <p className="text-xs text-slate-400 font-medium">{stats.uniqueScans} unique ({Math.round(stats.totalScans > 0 ? (stats.uniqueScans / stats.totalScans) * 100 : 0)}%)</p>
          </div>
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* QR Codes Card */}
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex items-center justify-between hover:border-secondary/40 transition-all group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-secondary" />
          <div className="space-y-1">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">QR Codes</span>
            <p className="text-3xl font-extrabold text-white group-hover:scale-105 transition-transform origin-left">{stats.totalQRs}</p>
            <p className="text-xs text-slate-400 font-medium">Active dynamic endpoints</p>
          </div>
          <div className="p-3 bg-secondary/10 rounded-xl text-secondary">
            <QrCode className="w-6 h-6" />
          </div>
        </div>

        {/* Leads Card */}
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex items-center justify-between hover:border-accent/40 transition-all group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
          <div className="space-y-1">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Leads Collected</span>
            <p className="text-3xl font-extrabold text-white group-hover:scale-105 transition-transform origin-left">{stats.totalLeads}</p>
            <p className="text-xs text-slate-400 font-medium">Captured from scan forms</p>
          </div>
          <div className="p-3 bg-accent/10 rounded-xl text-accent">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Conversion Rate Card */}
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex items-center justify-between hover:border-emerald-500/40 transition-all group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
          <div className="space-y-1">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Conversion Rate</span>
            <p className="text-3xl font-extrabold text-emerald-400 group-hover:scale-105 transition-transform origin-left">{stats.conversionRate}%</p>
            <p className="text-xs text-slate-400 font-medium">{stats.totalConversions} recorded sales/actions</p>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
            <Target className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Charts & Locations Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Custom Area Chart for Scan Trends */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="text-base font-semibold text-white">Scan Traffic Trend (Last 7 Days)</h3>
          </div>

          <div className="relative w-full h-[200px] flex items-end">
            {/* Custom Responsive SVG Chart */}
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4361ee" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#4361ee" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="#1e293b" strokeWidth="1" strokeDasharray="3" />
              <line x1={padding} y1={chartHeight / 2} x2={chartWidth - padding} y2={chartHeight / 2} stroke="#1e293b" strokeWidth="1" strokeDasharray="3" />
              <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#334155" strokeWidth="1.5" />

              {/* Area Under Line */}
              {points.length > 0 && (
                <polygon points={areaPointsStr} fill="url(#chartGradient)" />
              )}

              {/* Plotting Line */}
              {points.length > 0 && (
                <polyline points={pointsStr} fill="none" stroke="#4361ee" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              )}

              {/* Plotting Dot Pins */}
              {stats.trends.map((t, idx) => {
                const x = padding + (idx * (chartWidth - padding * 2)) / (stats.trends.length - 1 || 1);
                const y = chartHeight - padding - (t.scans * (chartHeight - padding * 2)) / maxScanValue;
                return (
                  <g key={idx} className="group/dot">
                    <circle cx={x} cy={y} r="5" fill="#4361ee" stroke="#ffffff" strokeWidth="1.5" className="hover:scale-125 transition-transform cursor-pointer" />
                    <text x={x} y={y - 10} fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle" className="opacity-0 group-hover/dot:opacity-100 transition-opacity bg-slate-900 px-1 py-0.5 rounded">
                      {t.scans}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Dates list label below chart */}
          <div className="flex justify-between px-3 text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
            {stats.trends.map((t, i) => (
              <span key={i}>{t.date}</span>
            ))}
          </div>
        </div>

        {/* Geolocation Top Rankings */}
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
            <Globe className="w-5 h-5 text-secondary" />
            <h3 className="text-base font-semibold text-white">Top Scan Locations</h3>
          </div>

          <div className="space-y-4 overflow-y-auto max-h-[200px] pr-1">
            {stats.locations.length === 0 ? (
              <p className="text-slate-500 text-xs text-center py-8">No geographic data logged yet.</p>
            ) : (
              stats.locations.map((loc, index) => {
                const pct = stats.totalScans > 0 ? Math.round((loc.scans / stats.totalScans) * 100) : 0;
                return (
                  <div key={index} className="space-y-1.5">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-white flex items-center gap-1.5">
                        <span className="text-xs text-slate-500">#{index + 1}</span>
                        {loc.country}
                      </span>
                      <span className="text-slate-400 text-xs">{loc.scans} scans ({pct}%)</span>
                    </div>
                    {/* Custom progress bar */}
                    <div className="w-full bg-slate-950 rounded-full h-2 border border-slate-850 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-500" 
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    {/* Top Cities inline details */}
                    <div className="text-[10px] text-slate-500 flex gap-2 pl-4">
                      <span>Cities:</span>
                      {loc.topCities.map((city, cidx) => (
                        <span key={cidx} className="text-slate-400">
                          {city.name} ({city.value})
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* System Analytics & Marketing UTMs Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Device Breakdown */}
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
            <Smartphone className="w-5 h-5 text-accent" />
            <h3 className="text-base font-semibold text-white">Device Breakdown</h3>
          </div>

          {stats.totalScans === 0 ? (
            <p className="text-slate-500 text-xs text-center py-8">No scans recorded.</p>
          ) : (
            <div className="space-y-4 pt-2">
              {/* Stacked device progress bar */}
              <div className="w-full h-4 bg-slate-950 rounded-lg overflow-hidden flex border border-slate-850">
                <div style={{ width: `${devMobilePct}%` }} className="bg-primary" title={`Mobile: ${devMobilePct}%`} />
                <div style={{ width: `${devDesktopPct}%` }} className="bg-secondary" title={`Desktop: ${devDesktopPct}%`} />
                <div style={{ width: `${devTabletPct}%` }} className="bg-accent" title={`Tablet: ${devTabletPct}%`} />
              </div>

              {/* Legends with stats */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-850/50">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary mx-auto mb-1" />
                  <p className="text-[10px] font-semibold text-slate-400 uppercase">Mobile</p>
                  <p className="text-sm font-bold text-white">{devMobilePct}%</p>
                </div>
                <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-850/50">
                  <div className="w-2.5 h-2.5 rounded-full bg-secondary mx-auto mb-1" />
                  <p className="text-[10px] font-semibold text-slate-400 uppercase">Desktop</p>
                  <p className="text-sm font-bold text-white">{devDesktopPct}%</p>
                </div>
                <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-850/50">
                  <div className="w-2.5 h-2.5 rounded-full bg-accent mx-auto mb-1" />
                  <p className="text-[10px] font-semibold text-slate-400 uppercase">Tablet</p>
                  <p className="text-sm font-bold text-white">{devTabletPct}%</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Operating Systems & Browsers */}
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
            <Compass className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-semibold text-white">OS & Browsers</h3>
          </div>

          <div className="space-y-4">
            {/* Top Operating Systems */}
            <div className="space-y-2">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest block">Top OS</span>
              {stats.os.length === 0 ? (
                <span className="text-slate-500 text-xs">No data</span>
              ) : (
                stats.os.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">{item.name}</span>
                    <span className="font-semibold text-white bg-slate-950 px-2 py-0.5 rounded border border-slate-850">{item.value} scans</span>
                  </div>
                ))
              )}
            </div>

            {/* Top Browsers */}
            <div className="space-y-2 pt-2 border-t border-slate-800/60">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest block">Top Browsers</span>
              {stats.browsers.length === 0 ? (
                <span className="text-slate-500 text-xs">No data</span>
              ) : (
                stats.browsers.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">{item.name}</span>
                    <span className="font-semibold text-white bg-slate-950 px-2 py-0.5 rounded border border-slate-850">{item.value} scans</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Campaign sources */}
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="text-base font-semibold text-white">Campaign UTM Sources</h3>
          </div>

          <div className="space-y-3">
            {stats.campaigns.length === 0 ? (
              <p className="text-slate-500 text-xs text-center py-8">No marketing campaign codes scanned.</p>
            ) : (
              stats.campaigns.map((camp, idx) => {
                const campPct = stats.totalScans > 0 ? Math.round((camp.value / stats.totalScans) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-300 truncate max-w-[150px]">{camp.name}</span>
                      <span className="text-slate-400">{camp.value} ({campPct}%)</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 border border-slate-850 overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: `${campPct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
