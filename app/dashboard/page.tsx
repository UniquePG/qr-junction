'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/components/AuthContext';
import { Globe, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

import DashboardTimeFilter from '@/components/DashboardTimeFilter';
import DashboardStatsCards from '@/components/DashboardStatsCards';
import DashboardCharts from '@/components/DashboardCharts';
import DashboardLocationsChart from '@/components/DashboardLocationsChart';

// Dynamically import DashboardMap with ssr disabled to prevent Next.js rendering issues on server-side
const DashboardMap = dynamic(() => import('@/components/DashboardMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[350px] bg-slate-50 animate-pulse rounded-2xl flex items-center justify-center border border-slate-100">
      <span className="text-slate-400 text-xs font-medium">Loading interactive map...</span>
    </div>
  ),
});

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
  cities: Array<{ name: string; country: string; value: number }>;
  campaigns: Array<{ name: string; value: number }>;
  scanPoints: Array<{ lat: number; lng: number; city: string; country: string; count: number }>;
}

export default function DashboardOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timelineLabel, setTimelineLabel] = useState('Last 7 Days');
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({});

  const fetchStats = async (start?: Date, end?: Date) => {
    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      
      const token = await currentUser.getIdToken();
      let url = '/api/dashboard/stats';
      
      const params = new URLSearchParams();
      if (start) params.append('startDate', start.toISOString());
      if (end) params.append('endDate', end.toISOString());
      
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      const res = await fetch(url, {
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

  // Initial stats load
  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const handleFilterChange = (start: Date, end: Date, label: string) => {
    setDateRange({ start, end });
    setTimelineLabel(label);
    fetchStats(start, end);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Welcome Title & Filter Control */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#001B50] tracking-tight">Hello, {user?.displayName || 'Creator'} 👋</h2>
          <p className="text-slate-500 text-sm mt-1">Here is how your QR codes and campaigns are performing.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden sm:inline">Timeline:</span>
          <DashboardTimeFilter onFilterChange={handleFilterChange} />
        </div>
      </div>

      {loading && !stats ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-slate-400 text-sm">Compiling scan analytics...</p>
        </div>
      ) : !stats ? (
        <div className="text-center py-12">
          <p className="text-slate-400">Failed to fetch overview metrics. Try refreshing.</p>
        </div>
      ) : (
        <div className={`space-y-8 transition-opacity duration-300 ${loading ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
          {/* KPI Metrics Summary Cards */}
          <DashboardStatsCards stats={stats} />

          {/* Map & Geolocation layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Interactive Heatmap Map */}
            <div className="lg:col-span-2 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs space-y-4 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <Globe className="w-4.5 h-4.5 text-primary" />
                  <h3 className="text-sm font-bold text-[#001B50] uppercase tracking-wider">Scan Distribution Heatmap</h3>
                </div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  {stats.scanPoints?.length || 0} Location Points
                </div>
              </div>
              <div className="w-full min-h-[350px] flex-1">
                <DashboardMap scanPoints={stats.scanPoints || []} />
              </div>
            </div>

            {/* Graphical circular locations chart */}
            <DashboardLocationsChart cities={stats.cities} totalScans={stats.totalScans} />
          </div>

          {/* Advanced Charts Grid (Trends, Devices, OS/Browser, UTM UTMs) */}
          <DashboardCharts stats={stats} />
        </div>
      )}
    </div>
  );
}
