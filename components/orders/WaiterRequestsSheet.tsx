"use client";

import { restaurantService } from "@/lib/api";
import { useOrderAlerts } from "@/components/orders/OrderAlerts";
import { formatTableLabel } from "@/lib/orders/displayId";
import { WAITER_REASON_LABELS, type WaiterReason } from "@/lib/waiter/types";
import { Bell, Check, Loader2, Volume2, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type WaiterRow = {
  id: number;
  tableNumber: string;
  reason: string;
  status: string;
  createdAt: string;
};

function labelFor(reason: string) {
  if (reason in WAITER_REASON_LABELS) return WAITER_REASON_LABELS[reason as WaiterReason];
  return reason;
}

function ageLabel(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const sec = Math.max(0, Math.floor(ms / 1000));
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  return `${Math.floor(min / 60)}h ago`;
}

export function WaiterRequestsSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const alerts = useOrderAlerts();
  const [rows, setRows] = useState<WaiterRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [ackingId, setAckingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await restaurantService.listWaiterRequests();
      if (!res.ok) return;
      setRows(Array.isArray(res.data.requests) ? res.data.requests : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    void load();
  }, [open, load, alerts.waiterTick]);

  async function acknowledge(id: number) {
    setAckingId(id);
    try {
      const res = await restaurantService.acknowledgeWaiterRequest(id);
      if (!res.ok) return;
      setRows((current) => current.filter((row) => row.id !== id));
      await alerts.refreshWaiterPending();
    } finally {
      setAckingId(null);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[55] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 border-none bg-black/45 cursor-pointer"
        aria-label="Close waiter requests"
        onClick={onClose}
      />
      <div className="relative z-[1] flex h-full w-full max-w-md flex-col bg-[#FBF7F2] shadow-[-12px_0_40px_rgba(28,20,16,0.18)]">
        <div className="flex items-center justify-between gap-3 border-b border-[#E7DDD2] px-4 py-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C4622D]">Floor</p>
            <h2 className="text-lg font-semibold text-[#1C1410]">Waiter requests</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border-none bg-white text-[#1C1410] cursor-pointer"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {!alerts.waiterSoundPreferred ? (
            <div className="mb-3 rounded-2xl border border-[#E7DDD2] bg-white px-3 py-2.5 text-xs text-[#6B5A50]">
              Waiter call sound is off. Turn it on in{" "}
              <Link href="/dashboard/restaurant/settings" className="font-semibold text-[#C4622D] no-underline">
                Settings
              </Link>{" "}
              to hear a chime on new calls.
            </div>
          ) : !alerts.waiterSoundReady ? (
            <button
              type="button"
              onClick={() => alerts.enableWaiterSound()}
              className="mb-3 inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-2xl border border-[#C4622D]/30 bg-[#FFF1E8] px-3 py-2.5 text-xs font-semibold text-[#C4622D]"
            >
              <Volume2 className="h-3.5 w-3.5" />
              Tap to unlock waiter sound in this browser
            </button>
          ) : null}
          {loading && rows.length === 0 ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#C4622D]" />
            </div>
          ) : rows.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-2 text-center">
              <Bell className="h-6 w-6 text-[#C9B8A8]" />
              <p className="text-sm font-medium text-[#1C1410]">No pending requests</p>
              <p className="max-w-[16rem] text-xs text-[#6B5A50]">
                When a guest calls from a table, it will show up here with a chime.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {rows.map((row, index) => {
                const newest = index === 0;
                return (
                  <li
                    key={row.id}
                    className={`rounded-2xl border bg-white p-4 ${
                      newest
                        ? "border-[#C4622D]/50 bg-[#FFF8F3] shadow-[0_0_0_3px_rgba(196,98,45,0.12)]"
                        : "border-[#E7DDD2]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#1C1410]">
                          {formatTableLabel(row.tableNumber)}
                        </p>
                        <p className="mt-0.5 text-sm text-[#6B5A50]">{labelFor(row.reason)}</p>
                        <p className="mt-1 text-[11px] text-[#9A8778]">{ageLabel(row.createdAt)}</p>
                      </div>
                      <button
                        type="button"
                        disabled={ackingId === row.id}
                        onClick={() => void acknowledge(row.id)}
                        className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border-none bg-[#1C1410] px-3 text-xs font-semibold text-white disabled:opacity-60"
                      >
                        {ackingId === row.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Check className="h-3.5 w-3.5" />
                        )}
                        Acknowledge
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
