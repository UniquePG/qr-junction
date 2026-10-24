"use client";

import {
  AdminEmpty,
  AdminLink,
  AdminLoading,
  AdminPagination,
  AdminSearch,
  AdminSelect,
  AdminTable,
} from "@/components/admin/AdminUI";
import { adminFetch, formatDate } from "@/lib/adminClient";
import React, { useEffect, useState } from "react";

const TYPES = ["URL","TEXT","WHATSAPP","EMAIL","PHONE","WIFI","SNAPCHAT","INSTAGRAM","FACEBOOK","LINKEDIN","TELEGRAM","TWITTER","CONTACT","SMS","APP_DOWNLOAD","PDF","LANDING_PAGE","REVIEW","RESTAURANT_MENU"];

export default function AdminQrsPage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
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
        const params = new URLSearchParams({ page: String(page), search, type, status });
        const data = await adminFetch(`/api/admin/qrs?${params}`);
        setRows(data.qrs || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
      } catch {
        setRows([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [search, type, status, page]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-[#001B50]">QR codes</h1>
        <p className="text-sm text-slate-500 mt-1">All generated codes across the platform.</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <AdminSearch value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Search name, short code, owner" />
        <AdminSelect value={type} onChange={(value) => { setType(value); setPage(1); }}>
          <option value="">All types</option>
          {TYPES.map((item) => <option key={item} value={item}>{item}</option>)}
        </AdminSelect>
        <AdminSelect value={status} onChange={(value) => { setStatus(value); setPage(1); }}>
          <option value="">Active + paused</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="PAUSED">PAUSED</option>
          <option value="DELETED">DELETED</option>
        </AdminSelect>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        {loading ? <AdminLoading /> : rows.length === 0 ? <AdminEmpty message="No QR codes found." /> : (
          <>
            <AdminTable headers={["QR", "Owner", "Type", "Status", "Scans", "Created", ""]}>
              {rows.map((qr) => (
                <tr key={qr.id}>
                  <td className="py-3 pr-4">
                    <p className="font-medium text-[#001B50]">{qr.name}</p>
                    <p className="text-xs text-slate-400">{qr.shortCode}</p>
                  </td>
                  <td className="py-3 pr-4 text-xs">{qr.user.email}</td>
                  <td className="py-3 pr-4 text-xs">{qr.type}</td>
                  <td className="py-3 pr-4 text-xs">{qr.status}</td>
                  <td className="py-3 pr-4">{qr.totalScans}</td>
                  <td className="py-3 pr-4 text-xs">{formatDate(qr.createdAt)}</td>
                  <td className="py-3 pr-4"><AdminLink href={`/admin/qrs/${qr.id}`}>View</AdminLink></td>
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
