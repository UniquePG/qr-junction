"use client";

import PasswordInput from "@/components/PasswordInput";
import { useAuth } from "@/components/AuthContext";
import { adminService, authService } from "@/lib/api";
import { ArrowRight, Loader2, Mail } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout, refreshUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;
    let cancelled = false;

    const verify = async () => {
      setChecking(true);
      try {
        await adminService.me();
        if (!cancelled) router.replace("/admin");
      } catch {
        toast.error("Invalid email or password.");
        await logout();
      } finally {
        if (!cancelled) setChecking(false);
      }
    };

    verify();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, logout, router]);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password.");
      return;
    }
    setLoading(true);
    try {
      const res = await authService.adminLogin({ email, password });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || "Invalid email or password.");
        return;
      }
      await refreshUser();
    } catch {
      toast.error("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || checking) {
    return (
      <div className="min-h-screen bg-[#001B50] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#001B50] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-2xl">
        <div className="mb-6">
          <Image
            src="/NewLogo/Logo.png"
            alt="QR Junction"
            width={80}
            height={30}
            className="h-12 w-auto object-contain"
            priority
          />
          <h1 className="text-xl font-bold text-[#001B50] mt-4">Admin Console</h1>
        </div>
        <p className="text-sm text-slate-500 mb-6">
          Sign in with an owner or admin account. Regular users cannot access this console.
        </p>

        <form onSubmit={handleCredentialsLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Email</label>
            <div className="relative mt-1.5">
              <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Admin email"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-primary placeholder-slate-400"
                required
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Password</label>
            <div className="mt-1.5">
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                autoComplete="current-password"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#001B50] text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign in to admin <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>
      </div>
    </div>
  );
}
