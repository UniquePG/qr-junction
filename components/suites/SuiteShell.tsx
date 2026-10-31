"use client";

import { useAuth } from "@/components/AuthContext";
import { SuiteBackProvider, useSuiteBackAction } from "@/components/suites/SuiteBack";
import { ArrowLeft, LayoutDashboard, LogOut, MoreHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useOrderAlerts } from "@/components/orders/OrderAlerts";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";

export type SuiteNavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  mobile?: boolean;
  soon?: boolean;
  center?: boolean;
  match?: string[];
};

export type SuiteTheme = {
  background: string;
  sidebar: string;
  sidebarBorder: string;
  text: string;
  muted: string;
  accent: string;
  accentText: string;
  card: string;
  eyebrow: string;
  title: string;
};

export type SuitePlace = {
  name: string;
  logoUrl?: string | null;
  detail?: string | null;
  href?: string;
};

function placeInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const source = parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : parts[0]?.slice(0, 2) || "R";
  return source.toUpperCase();
}

function PlaceAvatar({
  place,
  className,
}: {
  place: SuitePlace;
  className: string;
}) {
  return (
    <span className={`relative shrink-0 overflow-hidden bg-[#1C1410] text-white ${className}`}>
      {place.logoUrl ? (
        <img src={place.logoUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-[11px] font-semibold tracking-wide">
          {placeInitials(place.name)}
        </span>
      )}
    </span>
  );
}

function splitDock(items: SuiteNavItem[]) {
  const center = items.find((item) => item.center) ?? items[Math.floor(items.length / 2)] ?? null;
  const sides = center ? items.filter((item) => item.href !== center.href) : items;
  const midpoint = Math.ceil(sides.length / 2);
  return { center, left: sides.slice(0, midpoint), right: sides.slice(midpoint) };
}

function DockSlot({
  label,
  icon: Icon,
  active,
  theme,
  href,
  onClick,
}: {
  label: string;
  icon: LucideIcon;
  active: boolean;
  theme: SuiteTheme;
  href?: string;
  onClick: () => void;
}) {
  const body = (
    <>
      <span
        className="flex h-9 w-9 items-center justify-center rounded-full transition-transform duration-150"
        style={{
          background: active ? `color-mix(in srgb, ${theme.accent} 16%, white)` : "transparent",
          color: active ? theme.accent : theme.text,
          opacity: active ? 1 : 0.58,
        }}
      >
        <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.25 : 1.75} />
      </span>
      <span
        className="max-w-full truncate text-[10px] font-medium leading-none"
        style={{ color: active ? theme.accent : theme.text, opacity: active ? 1 : 0.58 }}
      >
        {label}
      </span>
    </>
  );

  const className =
    "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl border-none bg-transparent px-0.5 py-1 no-underline cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-95";

  if (href) {
    return (
      <Link href={href} onClick={onClick} aria-current={active ? "page" : undefined} className={className} style={{ outlineColor: theme.accent }}>
        {body}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className} style={{ outlineColor: theme.accent, color: theme.text }}>
      {body}
    </button>
  );
}

function MobileDock({
  theme,
  items,
  isActive,
  moreOpen,
  onMore,
  onNavigate,
}: {
  theme: SuiteTheme;
  items: SuiteNavItem[];
  isActive: (item: SuiteNavItem) => boolean;
  moreOpen: boolean;
  onMore: () => void;
  onNavigate: () => void;
}) {
  const alerts = useOrderAlerts();
  const { center, left, right } = splitDock(items);
  const CenterIcon = center?.icon;
  const centerActive = center ? isActive(center) : false;

  return (
    <nav
      className="suite-chrome md:hidden fixed inset-x-0 z-40 px-3 pointer-events-none"
      style={{ bottom: "max(0.7rem, env(safe-area-inset-bottom))" }}
      aria-label="Suite navigation"
    >
      <div className="pointer-events-auto relative mx-auto max-w-md">
        <div className="flex h-[78px] items-end rounded-[2rem] border border-black/[0.06] bg-white/95 px-1.5 pb-2 shadow-[0_16px_40px_rgba(28,20,16,0.16),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-md">
          <div className="flex min-w-0 flex-1 items-end">
            {left.map((item) => (
              <DockSlot
                key={item.href}
                label={item.name}
                icon={item.icon}
                active={isActive(item)}
                theme={theme}
                href={item.href}
                onClick={onNavigate}
              />
            ))}
          </div>

          {center && CenterIcon ? (
            <Link
              href={center.href}
              onClick={onNavigate}
              aria-current={centerActive ? "page" : undefined}
              className="relative flex h-full w-[4.75rem] shrink-0 flex-col items-center justify-end pb-1 no-underline focus-visible:outline-none"
            >
              <span
                className="absolute left-1/2 top-0 flex h-[62px] w-[62px] -translate-x-1/2 -translate-y-[54%] items-center justify-center rounded-full transition-transform duration-150 active:scale-95"
                style={{
                  background: `radial-gradient(circle at 35% 30%, color-mix(in srgb, white 28%, ${theme.accent}), ${theme.accent})`,
                  color: theme.accentText,
                  boxShadow: `0 12px 22px color-mix(in srgb, ${theme.accent} 38%, transparent), 0 0 0 5px white`,
                }}
              >
                <CenterIcon className="h-7 w-7" strokeWidth={2.1} />
                {center.href.endsWith("/orders") && alerts.placedCount > 0 ? (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-[#C4622D] shadow-sm">
                    {alerts.placedCount}
                  </span>
                ) : center.soon ? (
                  <span
                    className="absolute -right-2 -top-1 rounded-full bg-white px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide shadow-sm"
                    style={{ color: theme.accent }}
                  >
                    Soon
                  </span>
                ) : null}
              </span>
              <span
                className="max-w-full truncate text-[10px] font-semibold leading-none"
                style={{ color: centerActive ? theme.accent : theme.text, opacity: centerActive ? 1 : 0.72 }}
              >
                {center.name}
              </span>
            </Link>
          ) : (
            <div className="w-[4.75rem] shrink-0" />
          )}

          <div className="flex min-w-0 flex-1 items-end">
            {right.map((item) => (
              <DockSlot
                key={item.href}
                label={item.name}
                icon={item.icon}
                active={isActive(item)}
                theme={theme}
                href={item.href}
                onClick={onNavigate}
              />
            ))}
            <DockSlot
              label="More"
              icon={MoreHorizontal}
              active={moreOpen}
              theme={theme}
              onClick={onMore}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}

export function SuiteShell({
  theme,
  items,
  place,
  children,
}: {
  theme: SuiteTheme;
  items: SuiteNavItem[];
  place?: SuitePlace | null;
  children: React.ReactNode;
}) {
  return (
    <SuiteBackProvider>
      <SuiteShellFrame theme={theme} items={items} place={place}>
        {children}
      </SuiteShellFrame>
    </SuiteBackProvider>
  );
}

function SuiteShellFrame({
  theme,
  items,
  place,
  children,
}: {
  theme: SuiteTheme;
  items: SuiteNavItem[];
  place?: SuitePlace | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const alerts = useOrderAlerts();
  const { user, logout } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);
  const suiteBack = useSuiteBackAction();
  const suiteHome = pathname.startsWith("/dashboard/restaurant")
    ? "/dashboard/restaurant"
    : pathname.startsWith("/dashboard/reviews")
      ? "/dashboard/reviews"
      : "/dashboard";
  const nested = pathname.startsWith(`${suiteHome}/`);
  const stepBack = Boolean(suiteBack?.active) || nested;

  const isActive = (item: SuiteNavItem) => {
    if (item.match?.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
      return true;
    }
    if (pathname === item.href) return true;
    if (item.href !== "/dashboard/reviews" && item.href !== "/dashboard/restaurant") {
      return pathname.startsWith(`${item.href}/`);
    }
    return false;
  };

  const activeItem = items.find(isActive);
  const mobileItems = items.filter((item) => item.mobile);
  const overflowItems = items.filter((item) => !item.mobile);

  const navLink = (item: SuiteNavItem) => {
    const Icon = item.icon;
    const active = isActive(item);
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setMoreOpen(false)}
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors no-underline"
        style={{
          background: active ? theme.accent : "transparent",
          color: active ? theme.accentText : theme.muted,
        }}
      >
        <Icon className="w-4 h-4" />
        <span className="truncate">{item.name}</span>
        {item.href.endsWith("/orders") && alerts.placedCount > 0 ? (
          <span className="ml-auto min-w-5 rounded-full bg-white px-1.5 text-center text-[10px] font-bold text-[#C4622D]">{alerts.placedCount}</span>
        ) : item.soon ? (
          <span className="ml-auto text-[10px] uppercase tracking-wide opacity-70">Soon</span>
        ) : null}
      </Link>
    );
  };

  return (
    <div className="suite-shell h-dvh flex overflow-hidden print:h-auto print:overflow-visible print:block" style={{ background: theme.background, color: theme.text }}>
      <aside
        className="suite-chrome hidden md:flex flex-col w-64 shrink-0 h-full border-r"
        style={{ background: theme.sidebar, borderColor: theme.sidebarBorder, color: "#F8F4EF" }}
      >
        <div className="px-4 pt-4 pb-4 border-b" style={{ borderColor: theme.sidebarBorder }}>
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 px-1 text-xs no-underline" style={{ color: theme.muted }}>
            <ArrowLeft className="w-3.5 h-3.5" />
            Dashboard
          </Link>
          {place ? (
            <div className="mt-3 flex items-center gap-3 rounded-2xl bg-white/[0.05] px-3 py-3 ring-1 ring-white/10">
              <PlaceAvatar place={place} className="h-11 w-11 rounded-xl ring-1 ring-white/15" />
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold leading-tight text-white">{place.name}</p>
                <p className="mt-1 truncate text-xs" style={{ color: theme.muted }}>{place.detail || theme.eyebrow}</p>
              </div>
            </div>
          ) : (
            <>
              <p className="mt-4 px-1 text-[11px] uppercase tracking-[0.18em]" style={{ color: theme.muted }}>
                {theme.eyebrow}
              </p>
              <h1 className="mt-1 px-1 text-lg font-semibold text-white">{theme.title}</h1>
            </>
          )}
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {items.map((item) => navLink(item))}
        </nav>
        <div className="p-4 border-t" style={{ borderColor: theme.sidebarBorder }}>
          <p className="text-sm text-white truncate">{user?.displayName || "Account"}</p>
          <p className="text-xs truncate mb-3" style={{ color: theme.muted }}>{user?.email}</p>
          <button
            type="button"
            onClick={() => void logout()}
            className="w-full flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm cursor-pointer"
            style={{ borderColor: theme.sidebarBorder, color: "#F8F4EF", background: "transparent" }}
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 min-h-0 flex flex-col">
        <header
          className={`suite-chrome shrink-0 flex items-center justify-between gap-3 border-b bg-white px-4 md:px-6 ${place ? "h-16" : "h-14"}`}
          style={{ borderColor: place ? "#E7DDD2" : theme.sidebarBorder }}
        >
          <div className="flex items-center gap-2 min-w-0">
            {suiteBack?.active ? (
              <button
                type="button"
                onClick={suiteBack.run}
                aria-label="Back"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-transparent border-none cursor-pointer"
                style={{ color: theme.accent }}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <Link
                href={nested ? suiteHome : "/dashboard"}
                aria-label="Back"
                className={`flex h-9 w-9 shrink-0 items-center justify-center no-underline ${stepBack ? "" : "md:hidden"}`}
                style={{ color: theme.accent }}
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
            )}
            <div className="min-w-0">
              {place ? null : (
                <p className="text-[10px] uppercase tracking-[0.16em] opacity-55" style={{ color: theme.text }}>{theme.eyebrow}</p>
              )}
              <h2 className="truncate text-base font-semibold" style={{ color: theme.text }}>
                {activeItem?.name || theme.title}
              </h2>
            </div>
          </div>
          {place ? (
            <Link
              href={place.href || suiteHome}
              aria-label={`${place.name} profile`}
              className="flex min-w-0 items-center gap-2.5 rounded-full py-1 pl-1 pr-1 no-underline transition hover:bg-[#F6F1EA] sm:pl-3"
            >
              <span className="min-w-0 text-right">
                <span className="block max-w-[9.5rem] truncate text-sm font-semibold sm:max-w-[14rem]" style={{ color: theme.text }}>
                  {place.name}
                </span>
                {place.detail ? (
                  <span className="mt-0.5 hidden max-w-[14rem] truncate text-[11px] sm:block" style={{ color: "#6B5A50" }}>{place.detail}</span>
                ) : null}
              </span>
              <PlaceAvatar place={place} className="h-9 w-9 rounded-full ring-1 ring-[#E7DDD2]" />
            </Link>
          ) : null}
        </header>
        <main className="suite-shell-main flex-1 min-h-0 overflow-y-auto p-4 md:p-8 pb-32 md:pb-8 print:overflow-visible print:h-auto print:p-0">
          {children}
        </main>
      </div>

      <MobileDock
        theme={theme}
        items={mobileItems}
        isActive={isActive}
        moreOpen={moreOpen}
        onMore={() => setMoreOpen(true)}
        onNavigate={() => setMoreOpen(false)}
      />

      {moreOpen ? (
        <div className="suite-chrome md:hidden fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 border-none cursor-pointer"
            aria-label="Close menu"
            onClick={() => setMoreOpen(false)}
          />
          <div className="absolute bottom-0 inset-x-0 rounded-t-2xl bg-white p-4 pb-8 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold" style={{ color: theme.text }}>More</p>
              <button type="button" onClick={() => setMoreOpen(false)} className="p-1 bg-transparent border-none cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-1">
              {overflowItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl no-underline text-sm font-medium"
                    style={{ color: theme.text, background: isActive(item) ? theme.accent + "14" : "transparent" }}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                    {item.soon ? <span className="ml-auto text-[10px] uppercase tracking-wide" style={{ color: theme.accent }}>Soon</span> : null}
                  </Link>
                );
              })}
              <Link
                href="/dashboard"
                onClick={() => setMoreOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl no-underline text-sm font-medium"
                style={{ color: theme.text }}
              >
                <LayoutDashboard className="w-4 h-4" />
                Main dashboard
              </Link>
              <button
                type="button"
                onClick={() => void logout()}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm bg-transparent border-none cursor-pointer"
                style={{ color: theme.text }}
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
