"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getThemeChrome } from "@/components/menu/themeChrome";
import { formatWelcomeLine, pickWelcomeLine } from "@/lib/menu/welcomeCopy";

const HOLD_MS = 1150;
const EXIT_MS = 250;
const TOTAL_MS = HOLD_MS + EXIT_MS;

function storageKey(restaurantId: number | string) {
  return `qrj-menu-welcome:${restaurantId}`;
}

function themeMotion(theme: string) {
  if (theme === "neon" || theme === "gourmet" || theme === "board" || theme === "lantern") {
    return { panel: "menu-welcome-glow", logo: "menu-welcome-enter" };
  }
  if (theme === "stamp" || theme === "ticket" || theme === "playbill") {
    return { panel: "menu-welcome-enter", logo: "menu-welcome-stamp" };
  }
  return { panel: "menu-welcome-enter", logo: "menu-welcome-enter" };
}

function markSeen(restaurantId: number | string) {
  try {
    sessionStorage.setItem(storageKey(restaurantId), "1");
  } catch {
    // private mode / blocked storage
  }
}

export function MenuWelcomeOverlay({
  theme,
  restaurantId,
  restaurantName,
  logoUrl,
  disabled = false,
}: {
  theme: string;
  restaurantId: number | string;
  restaurantName: string;
  logoUrl?: string | null;
  disabled?: boolean;
}) {
  const chrome = getThemeChrome(theme);
  const motion = themeMotion(theme);
  const line = useMemo(() => {
    const template = pickWelcomeLine(theme, restaurantId);
    return formatWelcomeLine(template, restaurantName);
  }, [restaurantId, restaurantName, theme]);

  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    if (disabled || typeof window === "undefined") return;
    try {
      if (sessionStorage.getItem(storageKey(restaurantId))) return;
    } catch {
      // still show once this mount
    }

    setVisible(true);
    setExiting(false);

    const exitTimer = window.setTimeout(() => setExiting(true), HOLD_MS);
    const hideTimer = window.setTimeout(() => {
      markSeen(restaurantId);
      setVisible(false);
    }, TOTAL_MS);
    timersRef.current = [exitTimer, hideTimer];

    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };
  }, [disabled, restaurantId]);

  function dismiss() {
    if (!visible || exiting) return;
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
    setExiting(true);
    markSeen(restaurantId);
    const hideTimer = window.setTimeout(() => setVisible(false), EXIT_MS);
    timersRef.current = [hideTimer];
  }

  if (!visible) return null;

  const hasLogo = Boolean(logoUrl?.trim());

  return (
    <div
      role="dialog"
      aria-label="Welcome"
      aria-live="polite"
      tabIndex={0}
      className={`fixed inset-0 z-[55] flex items-center justify-center px-6 transition-opacity duration-[250ms] ${
        exiting ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      onClick={dismiss}
      onKeyDown={(event) => {
        if (event.key === "Escape" || event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          dismiss();
        }
      }}
    >
      <div className={`absolute inset-0 ${chrome.page}`} aria-hidden />
      <div className="absolute inset-0 bg-black/20" aria-hidden />

      <div
        className={`relative w-full max-w-sm overflow-hidden rounded-[1.75rem] border px-6 py-8 text-center shadow-[0_24px_60px_rgba(0,0,0,0.22)] ${chrome.card} ${motion.panel}`}
      >
        {hasLogo ? (
          <div
            className={`mx-auto mb-5 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-black/5 bg-white/90 shadow-sm ${motion.logo}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoUrl!} alt="" className="h-full w-full object-cover" />
          </div>
        ) : null}

        <p className={`text-[11px] font-bold uppercase tracking-[0.18em] ${chrome.modalMuted}`}>Welcome</p>
        <h2 className={`mt-2 text-2xl font-black tracking-tight wrap-anywhere ${chrome.title}`}>
          {restaurantName.trim() || "Our kitchen"}
        </h2>
        <p className={`mx-auto mt-3 max-w-[18rem] text-[15px] leading-snug ${chrome.modalMuted}`}>{line}</p>

        <div className="mx-auto mt-6 h-1 w-24 overflow-hidden rounded-full bg-black/10">
          <div
            className={`h-full w-full rounded-full bg-current opacity-70 ${exiting ? "" : "menu-welcome-progress"}`}
          />
        </div>
        <p className={`mt-3 text-[11px] font-medium ${chrome.modalMuted}`}>Tap to continue</p>
      </div>
    </div>
  );
}
