"use client";

import { AdminCard, AdminLink, AdminLoading, AdminTable } from "@/components/admin/AdminUI";
import { adminFetch, formatDate } from "@/lib/adminClient";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch(`/api/admin/users/${params.id}`)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <AdminLoading />;
  if (!data?.user) return <p className="text-sm text-slate-500">User not found.</p>;

  const user = data.user;

  return (
    <div className="space-y-6">
      <div>
        <AdminLink href="/admin/users">Back to users</AdminLink>
        <h1 className="text-2xl font-black text-[#001B50] mt-2">{user.name || user.email}</h1>
        <p className="text-sm text-slate-500">{user.email} · {user.role} · {user.provider || "password"}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="QR codes" value={user.qrCodes.length} />
        <Stat label="Scans" value={user.scanCount} />
        <Stat label="Review responses" value={user.reviewResponses} />
        <Stat label="Avg rating" value={user.avgRating.toFixed(1)} />
      </div>

      {user.profile ? (
        <AdminCard title="Profile">
          <p className="text-sm text-slate-600">
            {user.profile.businessName || "Individual"} · {user.profile.industry || "No industry"} · {user.profile.phone || "No phone"}
          </p>
        </AdminCard>
      ) : null}

      {user.restaurant ? (
        <AdminCard title="Restaurant">
          <AdminLink href={`/admin/restaurants/${user.restaurant.id}`}>{user.restaurant.name}</AdminLink>
          <p className="text-sm text-slate-500 mt-1">
            {user.restaurant._count.menus} menus · {user.restaurant._count.tables} tables
          </p>
        </AdminCard>
      ) : null}

      <AdminCard title="QR codes by type">
        <p className="text-sm text-slate-600">
          {Object.entries(user.qrTypes).map(([type, count]) => `${type}: ${count}`).join(" · ") || "None"}
        </p>
      </AdminCard>

      <AdminCard title="QR codes">
        <AdminTable headers={["Name", "Type", "Status", "Scans", ""]}>
          {user.qrCodes.map((qr: any) => (
            <tr key={qr.id}>
              <td className="py-2 pr-4">{qr.name}</td>
              <td className="py-2 pr-4">{qr.type}</td>
              <td className="py-2 pr-4">{qr.status}</td>
              <td className="py-2 pr-4">{qr.totalScans}</td>
              <td className="py-2 pr-4"><AdminLink href={`/admin/qrs/${qr.id}`}>View</AdminLink></td>
            </tr>
          ))}
        </AdminTable>
      </AdminCard>

      <AdminCard title="Campaigns">
        <AdminTable headers={["Name", "Created"]}>
          {user.campaigns.map((item: any) => (
            <tr key={item.id}>
              <td className="py-2 pr-4">{item.name}</td>
              <td className="py-2 pr-4 text-xs">{formatDate(item.createdAt)}</td>
            </tr>
          ))}
        </AdminTable>
      </AdminCard>

      <AdminCard title="Landing pages">
        <AdminTable headers={["Title", "Slug"]}>
          {user.landingPages.map((item: any) => (
            <tr key={item.id}>
              <td className="py-2 pr-4">{item.title}</td>
              <td className="py-2 pr-4 text-xs">/{item.slug}</td>
            </tr>
          ))}
        </AdminTable>
      </AdminCard>

      <AdminCard title="Leads">
        <AdminTable headers={["Name", "Email", "Status"]}>
          {user.leads.map((item: any) => (
            <tr key={item.id}>
              <td className="py-2 pr-4">{item.name}</td>
              <td className="py-2 pr-4 text-xs">{item.email}</td>
              <td className="py-2 pr-4 text-xs">{item.status}</td>
            </tr>
          ))}
        </AdminTable>
      </AdminCard>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4">
      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{label}</p>
      <p className="text-xl font-black text-[#001B50] mt-1">{value}</p>
    </div>
  );
}
