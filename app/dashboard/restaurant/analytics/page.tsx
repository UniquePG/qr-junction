'use client';

import React, { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/components/AuthContext';
import { 
  BarChart2, 
  Smartphone, 
  Monitor, 
  Tablet, 
  HelpCircle,
  Loader2,
  Calendar,
  Activity,
  Users,
  QrCode
} from 'lucide-react';
import { toast } from 'react-toastify';
import DashboardTimeFilter from '@/components/DashboardTimeFilter';

interface StatsData {
  totalScans: number;
  uniqueScans: number;
  devices: { MOBILE: number; DESKTOP: number; TABLET: number; UNKNOWN: number };
  tablePerformance: Array<{ name: string; scans: number; unique: number }>;
  trends: Array<{ date: string; scans: number }>;
}

export default function RestaurantAnalyticsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timelineLabel, setTimelineLabel] = useState('Last 7 Days');

  const fetchStats = async (start?: Date, end?: Date) => {
    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      
      const token = await currentUser.getIdToken();
      let url = '/api/restaurant/stats';
      
      const params = new URLSearchParams();
      if (start) params.append('startDate', start.toISOString());
      if (end) params.append('endDate', end.toISOString());
      
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error();
      const json = await res.json();
      setStats(json.stats);
    } catch (error) {
      console.error(error);
      toast.error('Could not load analytics metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const handleFilterChange = (start: Date, end: Date, label: string) => {
    setTimelineLabel(label);
    fetchStats(start, end);
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const deviceData = stats?.devices || { MOBILE: 0, DESKTOP: 0, TABLET: 0, UNKNOWN: 0 };
  const totalDeviceScans = (deviceData.MOBILE || 0) + (deviceData.DESKTOP || 0) + (deviceData.TABLET || 0) + (deviceData.UNKNOWN || 0) || 1;

  const getPercent = (val: number) => {
    return Math.round((val / totalDeviceScans) * 100);
  };

  const colors = ['bg-primary', 'bg-secondary', 'bg-emerald-500', 'bg-amber-500', 'bg-indigo-500', 'bg-pink-500'];

  return (
    <div className="max-w-6xl mx-auto pb-12 animate-fade-in space-y-8">
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#001B50] mb-2">Restaurant Analytics</h1>
          <p className="text-slate-600">Analyze QR scans, visitor trends, and physical table performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden sm:inline">Range:</span>
          <DashboardTimeFilter onFilterChange={handleFilterChange} />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-slate-400 text-sm">Compiling scan analytics...</p>
        </div>
      ) : !stats ? (
        <div className="text-center py-12">
          <p className="text-slate-400">Failed to compile metrics.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="bg-primary/10 rounded-xl p-3 text-primary">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Total Scans</span>
                <span className="text-2xl font-black text-[#001B50] mt-1 block">{stats.totalScans}</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="bg-secondary/10 rounded-xl p-3 text-secondary">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Unique Customers</span>
                <span className="text-2xl font-black text-[#001B50] mt-1 block">{stats.uniqueScans}</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="bg-emerald-50 rounded-xl p-3 text-emerald-600">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Active Locations</span>
                <span className="text-2xl font-black text-[#001B50] mt-1 block">{stats.tablePerformance.length}</span>
              </div>
            </div>
          </div>

          {/* Table Performance & Devices */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Table Performance */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-4 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-[#001B50] text-sm uppercase tracking-wider">Scans by Table Location</h3>
              </div>

              {stats.tablePerformance.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <p className="text-xs">No table scans recorded in this date range.</p>
                </div>
              ) : (
                <div className="space-y-4.5">
                  {stats.tablePerformance.map((table, idx) => {
                    const maxScans = stats.tablePerformance[0].scans || 1;
                    const percent = Math.round((table.scans / maxScans) * 100);
                    const colorClass = colors[idx % colors.length];

                    return (
                      <div key={table.name} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span>{table.name}</span>
                          <span className="text-slate-500">
                            {table.scans} scans ({table.unique} unique)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden">
                          <div 
                            className={`${colorClass} h-full rounded-full transition-all duration-500`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Devices Breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-[#001B50] text-sm uppercase tracking-wider">Device Breakdown</h3>
              </div>

              <div className="space-y-4">
                {/* Mobile */}
                <div className="flex items-center gap-4">
                  <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Mobile</span>
                      <span>{getPercent(deviceData.MOBILE)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 mt-1">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: `${getPercent(deviceData.MOBILE)}%` }} />
                    </div>
                  </div>
                </div>

                {/* Desktop */}
                <div className="flex items-center gap-4">
                  <div className="bg-indigo-50 text-indigo-650 p-2 rounded-lg">
                    <Monitor className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Desktop</span>
                      <span>{getPercent(deviceData.DESKTOP)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 mt-1">
                      <div className="bg-indigo-650 h-full rounded-full" style={{ width: `${getPercent(deviceData.DESKTOP)}%` }} />
                    </div>
                  </div>
                </div>

                {/* Tablet */}
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg">
                    <Tablet className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Tablet</span>
                      <span>{getPercent(deviceData.TABLET)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 mt-1">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${getPercent(deviceData.TABLET)}%` }} />
                    </div>
                  </div>
                </div>

                {/* Unknown */}
                <div className="flex items-center gap-4">
                  <div className="bg-slate-50 text-slate-600 p-2 rounded-lg">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Other</span>
                      <span>{getPercent(deviceData.UNKNOWN)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 mt-1">
                      <div className="bg-slate-500 h-full rounded-full" style={{ width: `${getPercent(deviceData.UNKNOWN)}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
