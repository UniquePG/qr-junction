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
import { adminService } from "@/lib/api";
import { formatDate } from "@/lib/adminClient";
import React, { useEffect, useState } from "react";

type UserRow = {
  id: number;
  email: string;
  name: string | null;
  role: string;
  provider: string | null;
  emailVerified: boolean;
  createdAt: string;
  lastActive: string;
  qrCount: number;
  scanCount: number;
  leadCount: number;
};

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [verified, setVerified] = useState("");
  const [provider, setProvider] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<UserRow[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await adminService.users<{ users: UserRow[]; totalPages: number; total: number }>({
          page: String(page),
          search,
          role,
          verified,
          provider,
        });
        setRows(data.users);
        setTotalPages(data.totalPages);
        setTotal(data.total || 0);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [search, role, verified, provider, page]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-[#001B50]">Users</h1>
        <p className="text-sm text-slate-500 mt-1">Every account, QR volume, and scan activity.</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <AdminSearch value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Search email or name" />
        <AdminSelect value={role} onChange={(value) => { setRole(value); setPage(1); }}>
          <option value="">All roles</option>
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
          <option value="OWNER">OWNER</option>
        </AdminSelect>
        <AdminSelect value={verified} onChange={(value) => { setVerified(value); setPage(1); }}>
          <option value="">All verification</option>
          <option value="true">Verified</option>
          <option value="false">Unverified</option>
        </AdminSelect>
        <AdminSelect value={provider} onChange={(value) => { setProvider(value); setPage(1); }}>
          <option value="">All providers</option>
          <option value="password">password</option>
          <option value="google.com">google.com</option>
        </AdminSelect>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        {loading ? (
          <AdminLoading />
        ) : rows.length === 0 ? (
          <AdminEmpty message="No users match these filters." />
        ) : (
          <>
            <AdminTable headers={["User", "Role", "Provider", "QRs", "Scans", "Last active", ""]}>
              {rows.map((user) => (
                <tr key={user.id} className="text-slate-700">
                  <td className="py-3 pr-4">
                    <p className="font-medium text-[#001B50]">{user.name || "Unnamed"}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </td>
                  <td className="py-3 pr-4 text-xs">
                    {user.role}
                    <span className="block text-slate-400">{user.emailVerified ? "Verified" : "Unverified"}</span>
                  </td>
                  <td className="py-3 pr-4 text-xs">{user.provider || "password"}</td>
                  <td className="py-3 pr-4">{user.qrCount}</td>
                  <td className="py-3 pr-4">{user.scanCount}</td>
                  <td className="py-3 pr-4 text-xs">{formatDate(user.lastActive)}</td>
                  <td className="py-3 pr-4">
                    <AdminLink href={`/admin/users/${user.id}`}>View</AdminLink>
                  </td>
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
