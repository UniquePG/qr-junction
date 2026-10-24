"use client";

import { AdminEmpty, AdminLink, AdminLoading, AdminPagination, AdminSearch, AdminSelect, AdminTable } from "@/components/admin/AdminUI";
import { adminFetch, formatDate } from "@/lib/adminClient";
import React, { useEffect, useState } from "react";

export default function AdminLeadsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page), search, status });
        const data = await adminFetch(`/api/admin/leads?${params}`);
        setRows(data.leads || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
      } catch {
        setRows([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [search, status, page]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-[#001B50]">Leads</h1>
        <p className="text-sm text-slate-500 mt-1">All captured leads across users and campaigns.</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <AdminSearch value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Search name, email, owner" />
        <AdminSelect value={status} onChange={(value) => { setStatus(value); setPage(1); }}>
          <option value="">All statuses</option>
          <option value="NEW">NEW</option>
          <option value="CONTACTED">CONTACTED</option>
          <option value="QUALIFIED">QUALIFIED</option>
          <option value="WON">WON</option>
          <option value="LOST">LOST</option>
        </AdminSelect>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        {loading ? <AdminLoading /> : rows.length === 0 ? <AdminEmpty message="No leads found." /> : (
          <>
            <AdminTable headers={["Lead", "Owner", "QR", "Status", "Created"]}>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="py-3 pr-4">
                    <p className="font-medium text-[#001B50]">{row.name}</p>
                    <p className="text-xs text-slate-400">{row.email}</p>
                  </td>
                  <td className="py-3 pr-4 text-xs"><AdminLink href={`/admin/users/${row.user.id}`}>{row.user.email}</AdminLink></td>
                  <td className="py-3 pr-4 text-xs">{row.qrCode ? <AdminLink href={`/admin/qrs/${row.qrCode.id}`}>{row.qrCode.name}</AdminLink> : "—"}</td>
                  <td className="py-3 pr-4 text-xs">{row.status}</td>
                  <td className="py-3 pr-4 text-xs">{formatDate(row.createdAt)}</td>
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
