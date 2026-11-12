"use client";

import PasswordInput from "@/components/PasswordInput";
import { authService } from "@/lib/api";
import { KeyRound, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

type Tone = "platform" | "suite" | "admin";

const tones = {
  platform: {
    card: "rounded-2xl border border-slate-200 bg-white",
    title: "text-[#001B50]",
    muted: "text-slate-500",
    label: "text-slate-600",
    button: "bg-[#001B50] hover:bg-[#00143c] text-white",
    input:
      "w-full bg-slate-50 border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-3 pl-12 pr-12 text-slate-800 placeholder-slate-400 transition-all outline-none",
  },
  suite: {
    card: "rounded-2xl border border-[#E7DDD2] bg-white",
    title: "text-[#1C1410]",
    muted: "text-[#6B5A50]",
    label: "text-[#6B5A50]",
    button: "bg-[#1C1410] hover:bg-[#2A211C] text-white",
    input:
      "w-full rounded-xl border border-[#E7DDD2] bg-[#FFFCF8] py-3 pl-12 pr-12 text-sm text-[#1C1410] outline-none placeholder:text-[#A89484] focus:border-[#C4622D]",
  },
  admin: {
    card: "rounded-2xl border border-slate-200 bg-white",
    title: "text-[#001B50]",
    muted: "text-slate-500",
    label: "text-slate-600",
    button: "bg-[#001B50] hover:bg-[#00143c] text-white",
    input:
      "w-full bg-slate-50 border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-3 pl-12 pr-12 text-slate-800 placeholder-slate-400 transition-all outline-none",
  },
} as const;

export default function ChangePasswordForm({ tone = "platform" }: { tone?: Tone }) {
  const t = tones[tone];
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Fill in all password fields.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      const res = await authService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      if (!res.ok) {
        const body = res.data as { error?: string };
        throw new Error(body?.error || "Could not change password.");
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not change password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={t.card}>
      <div className="border-b border-inherit px-5 py-4">
        <div className="flex items-center gap-2">
          <KeyRound className={`h-4 w-4 ${tone === "suite" ? "text-[#C4622D]" : "text-[#0046a1]"}`} />
          <h2 className={`text-sm font-bold ${t.title}`}>Change password</h2>
        </div>
        <p className={`mt-1 text-xs leading-5 ${t.muted}`}>
          Enter your current password, then choose a new one (at least 8 characters).
        </p>
      </div>
      <form onSubmit={(event) => void submit(event)} className="space-y-4 px-5 py-5">
        <label className={`block text-xs font-semibold uppercase tracking-wide ${t.label}`}>
          Current password
          <div className="mt-1.5">
            <PasswordInput
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              autoComplete="current-password"
              placeholder="Enter current password"
              className={t.input}
              required
            />
          </div>
        </label>
        <label className={`block text-xs font-semibold uppercase tracking-wide ${t.label}`}>
          New password
          <div className="mt-1.5">
            <PasswordInput
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
              placeholder="Enter new password"
              className={t.input}
              required
              minLength={8}
            />
          </div>
        </label>
        <label className={`block text-xs font-semibold uppercase tracking-wide ${t.label}`}>
          Confirm new password
          <div className="mt-1.5">
            <PasswordInput
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              placeholder="Confirm new password"
              className={t.input}
              required
              minLength={8}
            />
          </div>
        </label>
        <button
          type="submit"
          disabled={saving}
          className={`inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border-none px-5 text-sm font-semibold disabled:opacity-60 ${t.button}`}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {saving ? "Updating…" : "Update password"}
        </button>
      </form>
    </section>
  );
}
