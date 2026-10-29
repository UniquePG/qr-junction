"use client";

import { AdminCard, AdminLink, AdminLoading, AdminTable } from "@/components/admin/AdminUI";
import { adminService } from "@/lib/api";
import { formatDateTime } from "@/lib/adminClient";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function AdminQrDetailPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminService.qr(params.id).then(setData).catch(() => setError("QR code not found."));
  }, [params.id]);

  if (error) return <p className="text-sm text-slate-500">{error}</p>;
  if (!data?.qr) return <AdminLoading />;
  const qr = data.qr;

  return (
    <div className="space-y-6">
      <div>
        <AdminLink href="/admin/qrs">Back to QR codes</AdminLink>
        <h1 className="text-2xl font-black text-[#001B50] mt-2">{qr.name}</h1>
        <p className="text-sm text-slate-500">{qr.type} · {qr.status} · /q/{qr.shortCode}</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Box label="Total scans" value={qr.totalScans} />
        <Box label="Unique scans" value={qr.uniqueScans} />
        <Box label="Leads" value={qr._count.leads} />
        <Box label="Conversions" value={qr._count.conversions} />
      </div>
      <AdminCard title="Owner">
        <AdminLink href={`/admin/users/${qr.user.id}`}>{qr.user.email}</AdminLink>
      </AdminCard>
      <AdminCard title="Design">
        <p className="text-sm text-slate-600">
          Foreground {qr.fgColor || "#000000"} · Background {qr.bgColor || "#FFFFFF"}
          {qr.logoUrl ? ` · Logo ${qr.logoUrl}` : ""}
        </p>
      </AdminCard>
      <AdminCard title="UTM">
        <p className="text-sm text-slate-600">
          {qr.utmSource || "—"} / {qr.utmMedium || "—"} / {qr.utmCampaign || "—"}
        </p>
      </AdminCard>
      <AdminCard title="Destination">
        <pre className="text-xs bg-slate-50 rounded-xl p-4 overflow-x-auto">{JSON.stringify(qr.destination, null, 2)}</pre>
      </AdminCard>
      {qr.campaign || qr.landingPage || qr.restaurant ? (
        <AdminCard title="Links">
          <p className="text-sm text-slate-600">
            {qr.campaign ? `Campaign: ${qr.campaign.name}` : null}
            {qr.landingPage ? ` · Page: ${qr.landingPage.title}` : ""}
            {qr.restaurant ? ` · Restaurant: ${qr.restaurant.name}` : ""}
          </p>
        </AdminCard>
      ) : null}
      <AdminCard title="Recent scans">
        <AdminTable headers={["When", "Place", "Device"]}>
          {qr.recentScans.map((scan: any) => (
            <tr key={scan.id}>
              <td className="py-2 pr-4 text-xs">{formatDateTime(scan.scannedAt)}</td>
              <td className="py-2 pr-4 text-xs">{scan.city || "—"}, {scan.country || "—"}</td>
              <td className="py-2 pr-4 text-xs">{scan.deviceType} · {scan.os || ""}</td>
            </tr>
          ))}
        </AdminTable>
      </AdminCard>
    </div>
  );
}

function Box({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4">
      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{label}</p>
      <p className="text-xl font-black text-[#001B50] mt-1">{value}</p>
    </div>
  );
}
