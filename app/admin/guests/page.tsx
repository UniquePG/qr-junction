"use client";

import {
  AdminEmpty,
  AdminLoading,
  AdminPagination,
  AdminSearch,
  AdminSelect,
  AdminStatCard,
  AdminTable,
} from "@/components/admin/AdminUI";
import { adminService } from "@/lib/api";
import { formatDateTime } from "@/lib/adminClient";
import React, { useEffect, useState } from "react";

const TYPES = [
  "URL","TEXT","WHATSAPP","EMAIL","PHONE","WIFI","SNAPCHAT","INSTAGRAM","FACEBOOK",
  "LINKEDIN","TELEGRAM","TWITTER","CONTACT","SMS","APP_DOWNLOAD","PDF","LANDING_PAGE","REVIEW",
];

export default function AdminGuestsPage() {
  const [search, setSearch] = useState("");
  const [event, setEvent] = useState("");
  const [type, setType] = useState("");
  const [source, setSource] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [totals, setTotals] = useState({ generations: 0, downloads: 0, sessions: 0 });

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await adminService.guests({ page: String(page), search, event, type, source });
        setRows(data.events || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
        setTotals(data.totals || totals);
      } catch {
        setRows([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [search, event, type, source, page]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-[#001B50]">Guest generations</h1>
        <p className="text-sm text-slate-500 mt-1">
          Anonymous public-page activity, keyed by a first-party session cookie. QR content is never stored.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AdminStatCard label="Guest generations" value={totals.generations} />
        <AdminStatCard label="Guest downloads" value={totals.downloads} />
        <AdminStatCard label="Anonymous sessions" value={totals.sessions} />
      </div>

      <div className="flex flex-wrap gap-3">
        <AdminSearch value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Search session, city, page" />
        <AdminSelect value={event} onChange={(value) => { setEvent(value); setPage(1); }}>
          <option value="">All events</option>
          <option value="GENERATED">GENERATED</option>
          <option value="DOWNLOADED">DOWNLOADED</option>
        </AdminSelect>
        <AdminSelect value={type} onChange={(value) => { setType(value); setPage(1); }}>
          <option value="">All types</option>
          {TYPES.map((item) => <option key={item} value={item}>{item}</option>)}
        </AdminSelect>
        <AdminSelect value={source} onChange={(value) => { setSource(value); setPage(1); }}>
          <option value="">All sources</option>
          <option value="homepage">homepage</option>
          <option value="designer">designer</option>
          <option value="landing">landing</option>
        </AdminSelect>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        {loading ? <AdminLoading /> : rows.length === 0 ? <AdminEmpty message="No guest activity yet." /> : (
          <>
            <AdminTable headers={["When", "Session", "Event", "Type", "Source", "Place", "Device"]}>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="py-3 pr-4 text-xs">{formatDateTime(row.createdAt)}</td>
                  <td className="py-3 pr-4 font-mono text-[11px] text-slate-500">{row.sessionId.slice(0, 8)}</td>
                  <td className="py-3 pr-4 text-xs">{row.event}</td>
                  <td className="py-3 pr-4 text-xs">{row.qrType}</td>
                  <td className="py-3 pr-4 text-xs">
                    {row.source}
                    <span className="block text-slate-400">{row.sourcePath}</span>
                  </td>
                  <td className="py-3 pr-4 text-xs">{row.city || "—"}, {row.country || "—"}</td>
                  <td className="py-3 pr-4 text-xs">{row.deviceType} · {row.os || ""}</td>
                </tr>
              ))}
            </AdminTable>
            <AdminPagination page={page} totalPages={totalPages} total={total} onPage={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
