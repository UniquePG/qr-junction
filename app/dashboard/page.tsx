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
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

  // Calculate device percentages
  const totalDeviceScans = Object.values(stats.devices).reduce((a, b) => a + b, 0) || 1;
  const devMobilePct = Math.round((stats.devices.MOBILE / totalDeviceScans) * 100);
  const devDesktopPct = Math.round((stats.devices.DESKTOP / totalDeviceScans) * 100);
  const devTabletPct = Math.round((stats.devices.TABLET / totalDeviceScans) * 100);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Welcome Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#001B50] tracking-tight">Hello, {user?.displayName || 'Creator'} 👋</h2>
          <p className="text-slate-500 text-sm mt-1">Here is how your QR codes and campaigns are performing.</p>
        </div>
        <div className="text-xs text-slate-655 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
          Last 7 Days Scan Data
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Scans Card */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs hover:border-slate-300 transition-all hover:-translate-y-0.5 duration-350 flex items-center justify-between group relative overflow-hidden">
          <div className="space-y-2">
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest block">Total Scans</span>
            <p className="text-3xl font-extrabold text-[#001B50] tracking-tight">{stats.totalScans}</p>
            <p className="text-[10px] text-slate-500 font-medium">
              {stats.uniqueScans} unique scans ({stats.totalScans > 0 ? Math.round((stats.uniqueScans / stats.totalScans) * 100) : 0}%)
            </p>
          </div>
          <div className="p-3 bg-primary/10 rounded-xl text-primary border border-primary/15 group-hover:scale-105 transition-transform duration-300">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* QR Codes Card */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs hover:border-slate-300 transition-all hover:-translate-y-0.5 duration-355 flex items-center justify-between group relative overflow-hidden">
          <div className="space-y-2">
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest block">QR Codes</span>
            <p className="text-3xl font-extrabold text-[#001B50] tracking-tight">{stats.totalQRs}</p>
            <p className="text-[10px] text-slate-500 font-medium">Active dynamic assets</p>
          </div>
          <div className="p-3 bg-secondary/10 rounded-xl text-secondary border border-secondary/15 group-hover:scale-105 transition-transform duration-300">
            <QrCode className="w-5 h-5" />
          </div>
        </div>

        {/* Leads Card */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs hover:border-slate-300 transition-all hover:-translate-y-0.5 duration-360 flex items-center justify-between group relative overflow-hidden">
          <div className="space-y-2">
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest block">Leads Collected</span>
            <p className="text-3xl font-extrabold text-[#001B50] tracking-tight">{stats.totalLeads}</p>
            <p className="text-[10px] text-slate-500 font-medium">Captured from campaigns</p>
          </div>
          <div className="p-3 bg-accent/10 rounded-xl text-accent border border-accent/15 group-hover:scale-105 transition-transform duration-300">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Conversion Rate Card */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs hover:border-slate-300 transition-all hover:-translate-y-0.5 duration-365 flex items-center justify-between group relative overflow-hidden">
          <div className="space-y-2">
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest block">Conversion Rate</span>
            <p className="text-3xl font-extrabold text-emerald-600 tracking-tight">{stats.conversionRate}%</p>
            <p className="text-[10px] text-slate-500 font-medium">{stats.totalConversions} registered actions</p>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600 border border-emerald-500/15 group-hover:scale-105 transition-transform duration-300">
            <Target className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Charts & Locations Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Area Chart for Scan Trends */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 p-6 rounded-2xl space-y-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <BarChart3 className="w-4.5 h-4.5 text-primary" />
            <h3 className="text-sm font-bold text-[#001B50] uppercase tracking-wider">Scan Traffic Trend</h3>
          </div>

          <div className="w-full h-[220px] pt-4">
            {mounted ? (
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
                    labelClassName="text-slate-500"
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
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Geolocation Top Rankings */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <Globe className="w-4.5 h-4.5 text-secondary" />
            <h3 className="text-sm font-bold text-[#001B50] uppercase tracking-wider">Top Scan Locations</h3>
          </div>

          <div className="space-y-4 overflow-y-auto max-h-[220px] pr-1 flex-1 py-2">
            {stats.locations.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">No geographic data logged yet.</div>
            ) : (
              stats.locations.map((loc, index) => {
                const pct = stats.totalScans > 0 ? Math.round((loc.scans / stats.totalScans) * 100) : 0;
                return (
                  <div key={index} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-800 flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">#{index + 1}</span>
                        {loc.country}
                      </span>
                      <span className="text-slate-500">{loc.scans} scans ({pct}%)</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-1.5 border border-slate-200/50 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-500" 
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    {/* Top Cities details */}
                    <div className="text-[9px] text-slate-400 flex gap-2 pl-4">
                      <span>Cities:</span>
                      {loc.topCities.map((city, cidx) => (
                        <span key={cidx} className="text-slate-500">
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
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-4 shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <Smartphone className="w-4.5 h-4.5 text-accent" />
            <h3 className="text-sm font-bold text-[#001B50] uppercase tracking-wider">Device Breakdown</h3>
          </div>

          {stats.totalScans === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">No scans recorded.</div>
          ) : (
            <div className="space-y-4 pt-2">
              {/* Stacked device progress bar */}
              <div className="w-full h-3 bg-slate-100 rounded-lg overflow-hidden flex border border-slate-200/50">
                <div style={{ width: `${devMobilePct}%` }} className="bg-primary" title={`Mobile: ${devMobilePct}%`} />
                <div style={{ width: `${devDesktopPct}%` }} className="bg-secondary" title={`Desktop: ${devDesktopPct}%`} />
                <div style={{ width: `${devTabletPct}%` }} className="bg-accent" title={`Tablet: ${devTabletPct}%`} />
              </div>

              {/* Legends with stats */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/60">
                  <div className="w-2 h-2 rounded-full bg-primary mx-auto mb-1" />
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Mobile</p>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">{devMobilePct}%</p>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/60">
                  <div className="w-2 h-2 rounded-full bg-secondary mx-auto mb-1" />
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Desktop</p>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">{devDesktopPct}%</p>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/60">
                  <div className="w-2 h-2 rounded-full bg-accent mx-auto mb-1" />
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Tablet</p>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">{devTabletPct}%</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Operating Systems & Browsers */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-4 shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <Compass className="w-4.5 h-4.5 text-[#10B981]" />
            <h3 className="text-sm font-bold text-[#001B50] uppercase tracking-wider">OS & Browsers</h3>
          </div>

          <div className="space-y-4">
            {/* Top Operating Systems */}
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Top OS</span>
              {stats.os.length === 0 ? (
                <span className="text-slate-400 text-xs">No data</span>
              ) : (
                stats.os.map((item, idx) => (
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
              {stats.browsers.length === 0 ? (
                <span className="text-slate-400 text-xs">No data</span>
              ) : (
                stats.browsers.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">{item.name}</span>
                    <span className="font-semibold text-slate-700 bg-slate-50 px-2.5 py-0.5 rounded border border-slate-200">{item.value} scans</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Campaign sources */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-4 shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <Target className="w-4.5 h-4.5 text-primary" />
            <h3 className="text-sm font-bold text-[#001B50] uppercase tracking-wider">Campaign UTM Sources</h3>
          </div>

          <div className="space-y-3.5 max-h-[170px] overflow-y-auto pr-1">
            {stats.campaigns.length === 0 ? (
              <p className="text-slate-400 text-xs text-center py-10">No campaign UTM sources recorded.</p>
            ) : (
              stats.campaigns.map((camp, idx) => {
                const campPct = stats.totalScans > 0 ? Math.round((camp.value / stats.totalScans) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600 truncate max-w-[150px]">{camp.name}</span>
                      <span className="text-slate-500">{camp.value} scans ({campPct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1 border border-slate-200/50 overflow-hidden">
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
