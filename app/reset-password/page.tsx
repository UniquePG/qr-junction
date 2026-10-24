"use client";

import { ArrowRight, Loader2, Lock, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import { toast } from "react-toastify";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [checking, setChecking] = useState(true);
  const [valid, setValid] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const validate = async () => {
      if (!token) {
        setError("This reset link is invalid.");
        setValid(false);
        setChecking(false);
        return;
      }

      try {
        const res = await fetch(`/api/auth/password/validate?token=${encodeURIComponent(token)}`);
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok || !data.valid) {
          setError(data.error || "This reset link is invalid or has expired.");
          setValid(false);
        } else {
          setValid(true);
        }
      } catch {
        if (!cancelled) {
          setError("Could not verify this reset link. Try again.");
          setValid(false);
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    };

    validate();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password.");
      }
      toast.success(data.message || "Password updated. You can sign in now.");
      router.push("/login");
    } catch (submitError: unknown) {
      toast.error(submitError instanceof Error ? submitError.message : "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-slate-500">Checking your reset link...</p>
      </div>
    );
  }

  if (!valid) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
          <ShieldAlert className="w-6 h-6 text-amber-600" />
        </div>
        <p className="text-sm text-slate-600">{error}</p>
        <Link
          href="/forgot-password"
          className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-3 px-4 rounded-xl shadow-primary inline-flex items-center justify-center gap-2 transition-all"
        >
          Request a new link
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
          New Password
        </label>
        <div className="relative">
          <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 6 characters"
            className="w-full bg-slate-50 border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-3 pl-12 pr-4 text-slate-800 placeholder-slate-400 transition-all outline-none"
            required
            minLength={6}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
          Confirm Password
        </label>
        <div className="relative">
          <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            className="w-full bg-slate-50 border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-3 pl-12 pr-4 text-slate-800 placeholder-slate-400 transition-all outline-none"
            required
            minLength={6}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-3 px-4 rounded-xl shadow-primary hover:shadow-primary-hover flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group mt-2 border-none"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <span>Update password</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#001B50]/5 blur-[120px]" />

      <div className="w-full max-w-md bg-white border border-slate-200 p-8 rounded-2xl shadow-lg relative z-10 animate-fade-in">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-block text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-[#001B50] bg-clip-text text-transparent hover:opacity-95 transition-opacity"
          >
            QR Junction
          </Link>
          <h2 className="text-2xl font-semibold text-[#001B50] mt-4">Set a new password</h2>
          <p className="text-slate-650 text-sm mt-1">
            Choose a new password for your QR Junction account.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>

        <p className="text-center text-slate-600 text-sm mt-8">
          Remembered it?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
