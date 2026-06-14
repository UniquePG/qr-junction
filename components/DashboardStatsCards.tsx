'use client';

import React from 'react';
import { TrendingUp, QrCode, Users, Target } from 'lucide-react';

interface DashboardStatsCardsProps {
  stats: {
    totalScans: number;
    uniqueScans: number;
    totalQRs: number;
    totalLeads: number;
    conversionRate: number;
    totalConversions: number;
  };
}

export default function DashboardStatsCards({ stats }: DashboardStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Scans Card */}
      <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs hover:border-slate-300 transition-all hover:-translate-y-0.5 duration-300 flex items-center justify-between group relative overflow-hidden">
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
      <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs hover:border-slate-300 transition-all hover:-translate-y-0.5 duration-300 flex items-center justify-between group relative overflow-hidden">
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
      <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs hover:border-slate-300 transition-all hover:-translate-y-0.5 duration-300 flex items-center justify-between group relative overflow-hidden">
        <div className="space-y-2">
          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest block">Leads Collected</span>
          <p className="text-3xl font-extrabold text-[#001B50] tracking-tight">{stats.totalLeads}</p>
          <p className="text-[10px] text-slate-500 font-medium">Captured from campaigns</p>
        </div>
        <div className="p-3 bg-[#f59e0b]/10 rounded-xl text-[#d97706] border border-[#f59e0b]/15 group-hover:scale-105 transition-transform duration-300">
          <Users className="w-5 h-5" />
        </div>
      </div>

      {/* Conversion Rate Card */}
      <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs hover:border-slate-300 transition-all hover:-translate-y-0.5 duration-300 flex items-center justify-between group relative overflow-hidden">
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
  );
}
