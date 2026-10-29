"use client";

import { AdminEmpty, AdminLink, AdminLoading, AdminPagination, AdminSearch, AdminSelect, AdminTable } from "@/components/admin/AdminUI";
import { adminService } from "@/lib/api";
import { formatDateTime } from "@/lib/adminClient";
import React, { useEffect, useState } from "react";

export default function AdminScansPage() {
  const [search, setSearch] = useState("");
  const [device, setDevice] = useState("");
  const [country, setCountry] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await adminService.scans({ page: String(page), search, device, country });
        setRows(data.scans || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
      } catch {
        setRows([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [search, device, country, page]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-[#001B50]">Scans</h1>
        <p className="text-sm text-slate-500 mt-1">Raw scan explorer with location and device filters.</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <AdminSearch value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Search city, country, or QR" />
        <AdminSelect value={device} onChange={(value) => { setDevice(value); setPage(1); }}>
          <option value="">All devices</option>
          <option value="MOBILE">MOBILE</option>
          <option value="DESKTOP">DESKTOP</option>
          <option value="TABLET">TABLET</option>
          <option value="UNKNOWN">UNKNOWN</option>
        </AdminSelect>
        <AdminSearch value={country} onChange={(value) => { setCountry(value); setPage(1); }} placeholder="Filter country" />
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        {loading ? <AdminLoading /> : rows.length === 0 ? <AdminEmpty message="No scans found." /> : (
          <>
            <AdminTable headers={["When", "QR", "Owner", "Place", "Device"]}>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="py-3 pr-4 text-xs">{formatDateTime(row.scannedAt)}</td>
                  <td className="py-3 pr-4 text-xs"><AdminLink href={`/admin/qrs/${row.qrCode.id}`}>{row.qrCode.name}</AdminLink></td>
                  <td className="py-3 pr-4 text-xs"><AdminLink href={`/admin/users/${row.qrCode.user.id}`}>{row.qrCode.user.email}</AdminLink></td>
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
