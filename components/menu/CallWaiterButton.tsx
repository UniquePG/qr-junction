"use client";

import { publicService } from "@/lib/api";
import { getAnonymousId } from "@/lib/guestAnalytics";
import { toast } from "@/lib/toast";
import {
  WAITER_COOLDOWN_SECONDS,
  WAITER_REASON_LABELS,
  WAITER_REASONS,
  type WaiterReason,
} from "@/lib/waiter/types";
import { Bell, Loader2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

function cooldownStorageKey(restaurantId: number | string, tableNumber: string) {
  return `qrj-waiter-cooldown:${restaurantId}:${tableNumber}`;
}

function readCooldownUntil(restaurantId: number | string, tableNumber: string) {
  try {
    const raw = sessionStorage.getItem(cooldownStorageKey(restaurantId, tableNumber));
    const until = Number(raw);
    return Number.isFinite(until) ? until : 0;
  } catch {
    return 0;
  }
}

function writeCooldownUntil(restaurantId: number | string, tableNumber: string, until: number) {
  try {
    sessionStorage.setItem(cooldownStorageKey(restaurantId, tableNumber), String(until));
  } catch {
    // ignore
  }
}

function formatCountdown(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function CallWaiterButton({
  restaurantId,
  tableNumber,
  tableCode,
  themeClassName,
}: {
  restaurantId: number;
  tableNumber: string;
  tableCode?: string | null;
  themeClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<WaiterReason | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const tick = () => {
      const until = readCooldownUntil(restaurantId, tableNumber);
      const next = Math.max(0, Math.ceil((until - Date.now()) / 1000));
      setRemaining(next);
    };
    tick();
    const id = window.setInterval(tick, 500);
    return () => window.clearInterval(id);
  }, [restaurantId, tableNumber]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const coolingDown = remaining > 0;
  const reasons = useMemo(() => WAITER_REASONS, []);

  async function submit() {
    if (!reason || coolingDown || submitting) return;
    setSubmitting(true);
    try {
      let guestKey: string | null = null;
      try {
        guestKey = getAnonymousId();
      } catch {
        guestKey = null;
      }

      const res = await publicService.createWaiterRequest({
        restaurantId,
        tableCode: tableCode ?? "",
        reason,
        guestKey,
      });
      const data = res.data as {
        cooldownSeconds?: number;
        error?: string;
        code?: string;
      };

      if (!res.ok) {
        const cooldown =
          typeof data.cooldownSeconds === "number" && data.cooldownSeconds > 0
            ? data.cooldownSeconds
            : res.status === 429 || res.status === 409
              ? WAITER_COOLDOWN_SECONDS
              : 0;
        if (cooldown > 0) {
          writeCooldownUntil(restaurantId, tableNumber, Date.now() + cooldown * 1000);
          setRemaining(cooldown);
        }
        toast.error(data.error || "Could not call the waiter.");
        return;
      }

      const cooldown = Number(data.cooldownSeconds) || WAITER_COOLDOWN_SECONDS;
      writeCooldownUntil(restaurantId, tableNumber, Date.now() + cooldown * 1000);
      setRemaining(cooldown);
      setOpen(false);
      setReason(null);
      toast.success("Waiter notified");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not call the waiter.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        disabled={coolingDown}
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-bold cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
          themeClassName || "bg-amber-50 text-amber-800 border-amber-100"
        }`}
      >
        <Bell className="h-3.5 w-3.5" />
        {coolingDown ? `Wait ${formatCountdown(remaining)}` : "Call waiter"}
      </button>

      {mounted && open
        ? createPortal(
            <div className="fixed inset-0 z-[75] flex items-end justify-center px-0 sm:items-center sm:px-4">
              <button
                type="button"
                className="absolute inset-0 border-none bg-black/50 cursor-pointer"
                aria-label="Close"
                onClick={() => {
                  if (submitting) return;
                  setOpen(false);
                }}
              />
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Call waiter"
                className="relative z-[1] w-full max-w-md rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Service</p>
                    <h3 className="mt-1 text-lg font-black text-slate-900">Call waiter</h3>
                    <p className="mt-1 text-sm text-slate-500">What do you need?</p>
                  </div>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => setOpen(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border-none bg-slate-100 text-slate-700 cursor-pointer"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  {reasons.map((item) => {
                    const active = reason === item;
                    return (
                      <button
                        key={item}
                        type="button"
                        disabled={submitting}
                        onClick={() => setReason(item)}
                        className={`rounded-2xl border px-3 py-3 text-sm font-bold cursor-pointer ${
                          active
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 bg-slate-50 text-slate-800"
                        }`}
                      >
                        {WAITER_REASON_LABELS[item]}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  disabled={!reason || submitting || coolingDown}
                  onClick={() => void submit()}
                  className="mt-5 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-none bg-[#001B50] text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
                  {submitting ? "Sending…" : "Send request"}
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
