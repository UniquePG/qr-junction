"use client";

import PasswordInput from "@/components/PasswordInput";
import { useAuth } from "@/components/AuthContext";
import { adminFetch } from "@/lib/adminClient";
import { auth } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { ArrowRight, Chrome, Loader2, Mail } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;
    let cancelled = false;

    const verify = async () => {
      setChecking(true);
      try {
        await adminFetch("/api/admin/me");
        if (!cancelled) router.replace("/admin");
      } catch {
        toast.error("This account does not have admin access.");
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
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      toast.error(
        error.code === "auth/invalid-credential"
          ? "Invalid email or password."
          : "Failed to sign in.",
      );
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code !== "auth/popup-closed-by-user") {
        toast.error("Google sign-in failed.");
      }
    } finally {
      setGoogleLoading(false);
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

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading || googleLoading}
          className="w-full flex items-center justify-center gap-3 border border-slate-200 rounded-xl py-3 text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-50"
        >
          {googleLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Chrome className="w-5 h-5 text-red-400" />}
          Continue with Google
        </button>

        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-slate-200" />
          <span className="px-3 text-[10px] uppercase tracking-widest text-slate-400">or</span>
          <div className="flex-grow border-t border-slate-200" />
        </div>

        <form onSubmit={handleCredentialsLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Email</label>
            <div className="relative mt-1.5">
              <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-primary"
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
                required
                autoComplete="current-password"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full bg-[#001B50] text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign in to admin <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>
      </div>
    </div>
  );
}
