"use client";

import { useAuth } from "@/components/AuthContext";
import { needsEmailVerification, maskEmail } from "@/lib/emailVerification";
import { auth } from "@/lib/firebase";
import { ArrowRight, Loader2, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

const OTP_LOCK_KEY = "qrj_otp_lock";
const OTP_LENGTH = 6;

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout, refreshUser } = useAuth();

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [verifying, setVerifying] = useState(false);
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState("");
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const sentOnMount = useRef(false);

  const code = digits.join("");
  const firebaseUser = typeof window !== "undefined" ? auth.currentUser : null;

  const getToken = useCallback(async () => {
    const current = auth.currentUser;
    if (!current) return null;
    return current.getIdToken();
  }, []);

  const sendCode = useCallback(
    async (force = false) => {
      const token = await getToken();
      if (!token) return;

      if (!force) {
        const prev = Number(sessionStorage.getItem(OTP_LOCK_KEY) || 0);
        const elapsed = Date.now() - prev;
        if (prev && elapsed < 55_000) {
          setCooldown(Math.ceil((55_000 - elapsed) / 1000));
          return;
        }
        sessionStorage.setItem(OTP_LOCK_KEY, String(Date.now()));
      }

      setSending(true);
      setError("");
      try {
        const res = await fetch("/api/auth/otp/send", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => ({}));

        if (res.status === 429) {
          const retryAfter = Number(data.retryAfter || 60);
          setCooldown(retryAfter);
          return;
        }

        if (!res.ok) {
          sessionStorage.removeItem(OTP_LOCK_KEY);
          throw new Error(data.error || "Failed to send verification code.");
        }

        if (data.alreadyVerified) {
          await refreshUser();
          router.replace("/dashboard");
          return;
        }

        setCooldown(Number(data.retryAfter || 60));
        if (data.previewedInServer) {
          toast.info("SMTP is not configured. Check the server console for your code.");
        } else {
          toast.success("Verification code sent.");
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to send verification code.";
        setError(message);
        toast.error(message);
      } finally {
        setSending(false);
      }
    },
    [getToken, refreshUser, router],
  );

  useEffect(() => {
    if (authLoading) return;

    if (!user && !firebaseUser) {
      router.replace("/login");
      return;
    }

    if (user && !needsEmailVerification(user)) {
      router.replace("/dashboard");
      return;
    }

    if (user && needsEmailVerification(user) && !sentOnMount.current) {
      sentOnMount.current = true;
      void sendCode();
    }
  }, [authLoading, user, firebaseUser, router, sendCode]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => {
      setCooldown((value) => (value <= 1 ? 0 : value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async (value = code) => {
    if (value.length !== OTP_LENGTH || verifying) return;

    const token = await getToken();
    if (!token) {
      toast.error("Your session expired. Please sign in again.");
      router.replace("/login");
      return;
    }

    setVerifying(true);
    setError("");
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: value }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Invalid code.");
        toast.error(data.error || "Invalid code.");
        if (res.status === 429) {
          setDigits(Array(OTP_LENGTH).fill(""));
        }
        return;
      }

      sessionStorage.removeItem(OTP_LOCK_KEY);
      toast.success("Email verified. Welcome to QR Junction.");
      await refreshUser();
      router.replace("/dashboard");
    } catch {
      toast.error("Could not verify that code. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const updateDigit = (index: number, raw: string) => {
    const nextDigit = raw.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = nextDigit;
    setDigits(next);
    setError("");

    if (nextDigit && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }

    const joined = next.join("");
    if (joined.length === OTP_LENGTH) {
      void handleVerify(joined);
    }
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      const next = [...digits];
      next[index - 1] = "";
      setDigits(next);
      inputsRef.current[index - 1]?.focus();
    }
    if (event.key === "Enter") {
      void handleVerify();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((digit, index) => {
      next[index] = digit;
    });
    setDigits(next);
    inputsRef.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
    if (pasted.length === OTP_LENGTH) {
      void handleVerify(pasted);
    }
  };

  const handleLogout = async () => {
    sessionStorage.removeItem(OTP_LOCK_KEY);
    await logout();
    router.replace("/login");
  };

  if (authLoading || (!user && firebaseUser) || (user && !needsEmailVerification(user))) {
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

      <div className="w-full max-w-md bg-white border border-slate-200 p-8 rounded-2xl shadow-lg relative z-10">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-block text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-[#001B50] bg-clip-text text-transparent hover:opacity-95 transition-opacity"
          >
            QR Junction
          </Link>
          <div className="mx-auto mt-5 w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-semibold text-[#001B50] mt-4">
            Verify your email
          </h2>
          <p className="text-slate-600 text-sm mt-2 leading-relaxed">
            Enter the 6-digit code we sent to{" "}
            <span className="font-semibold text-[#001B50]">
              {maskEmail(user?.email)}
            </span>
            . You need this before you can open the dashboard.
          </p>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void handleVerify();
          }}
          className="space-y-6"
        >
          <div className="flex justify-center gap-2 sm:gap-3">
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(node) => {
                  inputsRef.current[index] = node;
                }}
                type="text"
                inputMode="numeric"
                autoComplete={index === 0 ? "one-time-code" : "off"}
                maxLength={1}
                value={digit}
                onChange={(event) => updateDigit(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                onPaste={handlePaste}
                className="w-11 h-12 sm:w-12 sm:h-14 text-center text-lg font-semibold text-[#001B50] bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                aria-label={`Digit ${index + 1}`}
              />
            ))}
          </div>

          {error ? (
            <p className="text-sm text-red-600 text-center">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={verifying || code.length !== OTP_LENGTH}
            className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-3 px-4 rounded-xl shadow-primary hover:shadow-primary-hover flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group border-none"
          >
            {verifying ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Verify and continue</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <button
            type="button"
            onClick={() => void sendCode(true)}
            disabled={sending || cooldown > 0}
            className="text-sm font-medium text-primary hover:underline disabled:text-slate-400 disabled:no-underline disabled:cursor-not-allowed inline-flex items-center gap-2 bg-transparent border-none cursor-pointer"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
          </button>
          <p className="text-sm text-slate-600">
            Wrong email?{" "}
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="text-primary font-medium hover:underline bg-transparent border-none cursor-pointer p-0"
            >
              Sign out and try again
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
