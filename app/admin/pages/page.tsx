"use client";

import { AdminEmpty, AdminLink, AdminLoading, AdminPagination, AdminSearch, AdminTable } from "@/components/admin/AdminUI";
import { adminFetch, formatDate } from "@/lib/adminClient";
import React, { useEffect, useState } from "react";

export default function AdminPagesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await adminFetch(`/api/admin/pages?page=${page}&search=${encodeURIComponent(search)}`);
        setRows(data.pages || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
      } catch {
        setRows([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [search, page]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-[#001B50]">Landing pages</h1>
        <p className="text-sm text-slate-500 mt-1">Public pages and how many QRs point to them.</p>
      </div>
      <AdminSearch value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Search title, slug, or owner" />
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        {loading ? <AdminLoading /> : rows.length === 0 ? <AdminEmpty message="No landing pages yet." /> : (
          <>
            <AdminTable headers={["Page", "Owner", "QRs", "Theme", "Created"]}>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="py-3 pr-4">
                    <p className="font-medium text-[#001B50]">{row.title}</p>
                    <p className="text-xs text-slate-400">/{row.slug}</p>
                  </td>
                  <td className="py-3 pr-4 text-xs"><AdminLink href={`/admin/users/${row.user.id}`}>{row.user.email}</AdminLink></td>
                  <td className="py-3 pr-4">{row._count.qrCodes}</td>
                  <td className="py-3 pr-4 text-xs">{row.theme}</td>
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
