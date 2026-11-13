"use client";

import { useAuth } from "@/components/AuthContext";
import { needsEmailVerification } from "@/lib/emailVerification";
import { authService } from "@/lib/api";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import PasswordInput from "@/components/PasswordInput";
import { ArrowRight, Chrome, Loader2, Mail, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from '@/lib/toast';

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading: authLoading, refreshUser } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;
    router.push(needsEmailVerification(user) ? "/verify-email" : "/dashboard");
  }, [user, authLoading, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      toast.error("All fields are required.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await authService.register({ email, password, name });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || "Failed to register.");
        return;
      }
      await refreshUser();
      toast.success("Account created. Check your email for a verification code.");
      router.push("/verify-email");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Failed to register. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      const res = await authService.google(idToken);
      try {
        await auth.signOut();
      } catch {
        /* Firebase client session not needed after cookie exchange */
      }
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || "Invalid email or password.");
        return;
      }
      await refreshUser();
      toast.success("Signed in with Google successfully!");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Google registration error:", error);
      if (error.code !== "auth/popup-closed-by-user") {
        toast.error("Google sign-in failed. Please try again.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 relative overflow-hidden py-12">
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
          <h1 className="text-2xl font-semibold text-[#001B50] mt-4">
            Create your account
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Create QR codes and manage them from your dashboard.
          </p>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
          type="button"
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 font-medium py-3 px-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group shadow-xs border-solid"
        >
          {googleLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
          ) : (
            <Chrome className="w-5 h-5 text-red-400 group-hover:scale-105 transition-transform" />
          )}
          <span>Sign up with Google</span>
        </button>

        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-slate-200" />
          <span className="px-3 text-xs text-slate-500 uppercase tracking-widest">
            or
          </span>
          <div className="flex-grow border-t border-slate-200" />
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Full Name
            </label>
            <div className="relative">
              <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-slate-50 border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-3 pl-12 pr-4 text-slate-800 placeholder-slate-400 transition-all outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-slate-50 border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-3 pl-12 pr-4 text-slate-800 placeholder-slate-400 transition-all outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Password
            </label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              required
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Confirm Password
            </label>
            <PasswordInput
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              required
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-3 px-4 rounded-xl shadow-primary hover:shadow-primary-hover flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group mt-4 border-none"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Sign Up Free</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-slate-600 text-sm mt-8">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary font-medium hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
