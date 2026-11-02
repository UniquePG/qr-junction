"use client";

import { AdminCard } from "@/components/admin/AdminUI";
import { adminService } from "@/lib/api";
import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function AdminUserPlan({ userId }: { userId: number }) {
  const [name, setName] = useState("Plan");
  const [status, setStatus] = useState("");

  useEffect(() => {
    adminService.userSubscription<{
      billing: { plan: { name: string } | null; subscription: { status: string } | null };
    }>(userId).then((data) => {
      setName(data.billing.plan?.name || "Free");
      setStatus(data.billing.subscription?.status || "ACTIVE");
    }).catch(() => setName("Plan"));
  }, [userId]);

  return (
    <AdminCard
      title="Subscription"
      action={
        <Link href={`/admin/users/${userId}/plan`} className="rounded-xl bg-[#001B50] px-3 py-1.5 text-xs font-semibold text-white no-underline">
          Manage plan
        </Link>
      }
    >
      <p className="text-sm font-semibold text-[#001B50]">{name}{status ? ` · ${status}` : ""}</p>
      <p className="mt-1 text-sm text-slate-500">Change the plan, grace period, locked price, and feature overrides on the plan page.</p>
    </AdminCard>
  );
}
