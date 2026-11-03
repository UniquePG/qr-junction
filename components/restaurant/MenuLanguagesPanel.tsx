"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

type LocaleRow = {
  code: string;
  label: string;
  allowed: boolean;
  locked: boolean;
  active: boolean;
  status: string;
  lastError: string | null;
  enabledInDb: boolean;
};

export default function MenuLanguagesPanel() {
  const [locales, setLocales] = useState<LocaleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyCode, setBusyCode] = useState<string | null>(null);

  const [needsProfile, setNeedsProfile] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/restaurant/locales");
      const data = await res.json().catch(() => null);
      if (res.status === 400) {
        setNeedsProfile(true);
        setLocales([]);
        return;
      }
      if (!res.ok) {
        throw new Error(data?.error || "Failed to load languages");
      }
      setNeedsProfile(false);
      setLocales(Array.isArray(data?.locales) ? data.locales : []);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to load languages");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const pending = locales.some((row) => row.active && row.status === "pending");
    if (!pending) return;
    const timer = window.setInterval(() => {
      void load();
    }, 2500);
    return () => window.clearInterval(timer);
  }, [locales, load]);

  async function enable(code: string) {
    setBusyCode(code);
    try {
      const res = await fetch("/api/restaurant/locales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Could not enable language");
      toast.success(`Translating menu into ${data?.locale?.label || code}…`);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not enable language");
    } finally {
      setBusyCode(null);
    }
  }

  async function patch(code: string, action: "activate" | "deactivate" | "retry") {
    setBusyCode(code);
    try {
      const res = await fetch("/api/restaurant/locales", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, action }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Could not update language");
      if (action === "retry") toast.success("Re-translation started");
      if (action === "deactivate") toast.success("Language hidden from guest menu");
      if (action === "activate") toast.success("Language shown on guest menu");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update language");
    } finally {
      setBusyCode(null);
    }
  }

  function statusLabel(row: LocaleRow) {
    if (row.locked) return "Always on";
    if (!row.enabledInDb) return "Not translated yet";
    if (row.status === "pending") return "Translating…";
    if (row.status === "failed") return "Failed";
    if (!row.active) return "Inactive";
    return "Ready";
  }

  return (
    <section className="rounded-2xl border border-[#E7DDD2] bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#1C1410]">Menu languages</h2>
          <p className="mt-1 text-sm text-[#6B5E54]">
            English stays the owner source of truth. Guests can switch among languages you enable.
            Translations use Sarvam and stay in sync when you edit the menu.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#E7DDD2] bg-[#FBF7F2] px-3 py-1.5 text-xs font-medium text-[#1C1410]"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="mt-6 flex items-center gap-2 text-sm text-[#6B5E54]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading languages…
        </div>
      ) : needsProfile ? (
        <p className="mt-5 text-sm text-[#6B5E54]">
          Save your restaurant profile first, then enable guest menu languages here.
        </p>
      ) : (
        <ul className="mt-5 divide-y divide-[#F0E8DF]">
          {locales.map((row) => {
            const busy = busyCode === row.code;
            return (
              <li key={row.code} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
                <div>
                  <p className="text-sm font-semibold text-[#1C1410]">{row.label}</p>
                  <p className="text-xs text-[#8A7B6F]">
                    {statusLabel(row)}
                    {!row.allowed && !row.locked ? " · Upgrade plan to unlock" : ""}
                  </p>
                  {row.status === "failed" && row.lastError ? (
                    <p className="mt-1 max-w-md text-xs text-red-600">{row.lastError}</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {row.locked ? (
                    <span className="rounded-full bg-[#F0E8DF] px-3 py-1 text-xs font-medium text-[#6B5E54]">
                      Default
                    </span>
                  ) : !row.allowed ? (
                    <span className="rounded-full bg-[#F7EFE7] px-3 py-1 text-xs font-medium text-[#C4622D]">
                      Plan locked
                    </span>
                  ) : !row.enabledInDb ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void enable(row.code)}
                      className="rounded-lg bg-[#1C1410] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      {busy ? "Starting…" : "Enable & translate"}
                    </button>
                  ) : (
                    <>
                      {row.status === "failed" || row.status === "ready" ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void patch(row.code, "retry")}
                          className="rounded-lg border border-[#E7DDD2] px-3 py-1.5 text-xs font-medium text-[#1C1410] disabled:opacity-50"
                        >
                          {busy ? "…" : "Re-translate"}
                        </button>
                      ) : null}
                      {row.active ? (
                        <button
                          type="button"
                          disabled={busy || row.status === "pending"}
                          onClick={() => void patch(row.code, "deactivate")}
                          className="rounded-lg border border-[#E7DDD2] px-3 py-1.5 text-xs font-medium text-[#1C1410] disabled:opacity-50"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void patch(row.code, "activate")}
                          className="rounded-lg bg-[#1C1410] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                        >
                          Activate
                        </button>
                      )}
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
