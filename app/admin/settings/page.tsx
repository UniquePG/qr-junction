"use client";

import ChangePasswordForm from "@/components/auth/ChangePasswordForm";
import { useAuth } from "@/components/AuthContext";

export default function AdminSettingsPage() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#001B50]">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your admin account password for {user?.email || "this account"}.
        </p>
      </div>
      <ChangePasswordForm tone="admin" />
    </div>
  );
}
