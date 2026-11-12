"use client";

import ChangePasswordForm from "@/components/auth/ChangePasswordForm";
import { useAuth } from "@/components/AuthContext";

export default function PlatformSettingsPage() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-2xl animate-fade-in pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#001B50] mb-2">Settings</h1>
        <p className="text-slate-600">
          Manage account security for {user?.email || "your account"}.
        </p>
      </div>
      <ChangePasswordForm tone="platform" />
    </div>
  );
}
