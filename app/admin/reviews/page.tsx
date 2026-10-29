"use client";

import { AdminEmpty, AdminLink, AdminLoading, AdminPagination, AdminSearch, AdminTable } from "@/components/admin/AdminUI";
import { adminService } from "@/lib/api";
import { formatDate } from "@/lib/adminClient";
import React, { useEffect, useState } from "react";

export default function AdminReviewsPage() {
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
        const data = await adminService.reviews({ page, search });
        setRows(data.reviews || []);
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
        <h1 className="text-2xl font-black text-[#001B50]">Review suite</h1>
        <p className="text-sm text-slate-500 mt-1">Review QR campaigns, ratings, and feedback volume.</p>
      </div>
      <AdminSearch value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Search business or owner" />
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        {loading ? <AdminLoading /> : rows.length === 0 ? <AdminEmpty message="No review campaigns yet." /> : (
          <>
            <AdminTable headers={["Business", "Owner", "Scans", "Responses", "Avg rating", "Last response", ""]}>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="py-3 pr-4 font-medium text-[#001B50]">{row.businessName}</td>
                  <td className="py-3 pr-4 text-xs"><AdminLink href={`/admin/users/${row.owner.id}`}>{row.owner.email}</AdminLink></td>
                  <td className="py-3 pr-4">{row.totalScans}</td>
                  <td className="py-3 pr-4">{row.responseCount}</td>
                  <td className="py-3 pr-4">{row.averageRating.toFixed(1)}</td>
                  <td className="py-3 pr-4 text-xs">{formatDate(row.lastResponseAt)}</td>
                  <td className="py-3 pr-4"><AdminLink href={`/admin/reviews/${row.id}`}>View</AdminLink></td>
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
