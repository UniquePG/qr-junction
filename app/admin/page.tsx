"use client";

import DashboardMap from "@/components/DashboardMap";
import DashboardTimeFilter from "@/components/DashboardTimeFilter";
import { AdminCard, AdminLoading, AdminStatCard } from "@/components/admin/AdminUI";
import { adminFetch } from "@/lib/adminClient";
import React, { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = ["#0046a1", "#001B50", "#f59e0b", "#10b981", "#ef4444", "#6366f1", "#14b8a6"];

type OverviewResponse = {
  stats: {
    totalUsers: number;
    newUsers: number;
    totalQrs: number;
    newQrs: number;
    totalScans: number;
    uniqueVisitors: number;
    reviewQrs: number;
    reviewResponses: number;
    avgRating: number;
    restaurants: number;
    menus: number;
    tables: number;
    leads: number;
    conversions: number;
    guestGenerations: number;
    guestDownloads: number;
    guestSessions: number;
  };
  charts: {
    usersByDay: Array<{ date: string; users: number }>;
    qrsByDay: Array<{ date: string; type: string; count: number }>;
    scansByDay: Array<{ date: string; scans: number }>;
    qrTypes: Array<{ type: string; count: number }>;
    devices: Array<{ device: string; count: number }>;
    countries: Array<{ country: string; count: number }>;
    cities: Array<{ city: string; count: number }>;
    guestByDay: Array<{ date: string; guests: number }>;
    guestTypes: Array<{ type: string; count: number }>;
    guestSources: Array<{ source: string; count: number }>;
    scanPoints: Array<{ lat: number; lng: number; city: string; country: string; count: number }>;
  };
};

export default function AdminOverviewPage() {
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState("Last 7 Days");

  const load = async (start?: Date | null, end?: Date | null) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (start === null && end === null) params.set("range", "all");
      if (start) params.set("startDate", start.toISOString());
      if (end) params.set("endDate", end.toISOString());
      const json = await adminFetch<OverviewResponse>(`/api/admin/overview?${params.toString()}`);
      setData(json);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const qrTrend = useMemo(() => {
    const map = new Map<string, Record<string, string | number>>();
    data?.charts.qrsByDay.forEach((row) => {
      const current = map.get(row.date) || { date: row.date, total: 0 };
      current[row.type] = Number(current[row.type] || 0) + row.count;
      current.total = Number(current.total || 0) + row.count;
      map.set(row.date, current);
    });
    return Array.from(map.values());
  }, [data]);

  const qrTypes = useMemo(() => {
    const types = new Set<string>();
    data?.charts.qrsByDay.forEach((row) => types.add(row.type));
    return Array.from(types);
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#001B50]">Platform overview</h1>
          <p className="text-sm text-slate-500 mt-1">Usage across QR Junction for {label.toLowerCase()}.</p>
        </div>
        <DashboardTimeFilter
          onFilterChange={(start, end, nextLabel) => {
            setLabel(nextLabel);
            load(start, end);
          }}
        />
      </div>

      {loading && !data ? (
        <AdminLoading />
      ) : !data ? (
        <p className="text-sm text-slate-500">Could not load admin analytics.</p>
      ) : (
        <div className={`space-y-6 ${loading ? "opacity-60" : ""}`}>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <AdminStatCard label="All users" value={data.stats.totalUsers} hint={`${data.stats.newUsers} new in range`} />
            <AdminStatCard label="QR codes" value={data.stats.totalQrs} hint={`${data.stats.newQrs} created in range`} />
            <AdminStatCard label="Total scans" value={data.stats.totalScans} hint={`${data.stats.uniqueVisitors} unique visitors`} />
            <AdminStatCard label="Reviews" value={data.stats.reviewResponses} hint={`Avg ${data.stats.avgRating.toFixed(1)} / 5`} />
            <AdminStatCard label="Restaurants" value={data.stats.restaurants} hint={`${data.stats.menus} menus · ${data.stats.tables} tables`} />
            <AdminStatCard label="Review QRs" value={data.stats.reviewQrs} />
            <AdminStatCard label="Leads" value={data.stats.leads} />
            <AdminStatCard label="Conversions" value={data.stats.conversions} />
            <AdminStatCard label="Guest QR gens" value={data.stats.guestGenerations} hint={`${data.stats.guestSessions} anonymous sessions`} />
            <AdminStatCard label="Guest downloads" value={data.stats.guestDownloads} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <AdminCard title="New users by day">
              <ChartArea data={data.charts.usersByDay} dataKey="users" color="#0046a1" />
            </AdminCard>
            <AdminCard title="QR codes generated by day">
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={qrTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    {qrTypes.map((type, index) => (
                      <Bar key={type} dataKey={type} stackId="qr" fill={COLORS[index % COLORS.length]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </AdminCard>
            <AdminCard title="Scans by day">
              <ChartArea data={data.charts.scansByDay} dataKey="scans" color="#f59e0b" />
            </AdminCard>
            <AdminCard title="Scan countries">
              <BarBlock data={data.charts.countries} dataKey="country" />
            </AdminCard>
            <AdminCard title="Scan cities">
              <BarBlock data={data.charts.cities} dataKey="city" />
            </AdminCard>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <AdminCard title="QR type mix">
              <PieBlock data={data.charts.qrTypes.map((item) => ({ name: item.type, value: item.count }))} />
            </AdminCard>
            <AdminCard title="Device mix">
              <PieBlock data={data.charts.devices.map((item) => ({ name: item.device, value: item.count }))} />
            </AdminCard>
            <AdminCard title="Scan locations">
              <div className="min-h-[260px]">
                <DashboardMap scanPoints={data.charts.scanPoints} />
              </div>
            </AdminCard>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <AdminCard title="Guest generations by day">
              <ChartArea data={data.charts.guestByDay || []} dataKey="guests" color="#6366f1" />
            </AdminCard>
            <AdminCard title="Guest QR types">
              <PieBlock data={(data.charts.guestTypes || []).map((item) => ({ name: item.type, value: item.count }))} />
            </AdminCard>
            <AdminCard title="Guest sources">
              <BarBlock data={data.charts.guestSources || []} dataKey="source" />
            </AdminCard>
          </div>
        </div>
      )}
    </div>
  );
}

function ChartArea({
  data,
  dataKey,
  color,
}: {
  data: Array<Record<string, string | number>>;
  dataKey: string;
  color: string;
}) {
  return (
    <div className="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Area type="monotone" dataKey={dataKey} stroke={color} fill={color} fillOpacity={0.15} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function BarBlock({ data, dataKey }: { data: Array<Record<string, string | number>>; dataKey: string }) {
  return (
    <div className="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey={dataKey} tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="count" fill="#0046a1" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function PieBlock({ data }: { data: Array<{ name: string; value: number }> }) {
  return (
    <div className="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
