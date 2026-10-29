"use client";

import { useAuth } from "@/components/AuthContext";
import { adminService } from "@/lib/api";
import {
  Fingerprint,
  FolderOpen,
  Globe,
  Layout,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  QrCode,
  Star,
  Users,
  Utensils,
  UserRound,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const NAV = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: UserRound },
  { name: "QR Codes", href: "/admin/qrs", icon: QrCode },
  { name: "Guests", href: "/admin/guests", icon: Fingerprint },
  { name: "Review Suite", href: "/admin/reviews", icon: Star },
  { name: "Restaurants", href: "/admin/restaurants", icon: Utensils },
  { name: "Campaigns", href: "/admin/campaigns", icon: FolderOpen },
  { name: "Landing Pages", href: "/admin/pages", icon: Layout },
  { name: "Leads", href: "/admin/leads", icon: Users },
  { name: "Scans", href: "/admin/scans", icon: Globe },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }
  return <AuthenticatedShell>{children}</AuthenticatedShell>;
}

function AuthenticatedShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [adminRole, setAdminRole] = useState("");
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/admin/login");
      return;
    }

    let cancelled = false;
    adminService.me<{ admin: { name: string | null; email: string; role: string } }>()
      .then((data) => {
        if (cancelled) return;
        setAdminName(data.admin.name || data.admin.email);
        setAdminRole(data.admin.role);
        setReady(true);
      })
      .catch(async () => {
        await logout();
        router.replace("/admin/login");
      });

    return () => {
      cancelled = true;
    };
  }, [user, loading, logout, router]);

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!navOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setNavOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [navOpen]);

  if (loading || !ready) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const sidebar = (
    <>
      <div className="h-[72px] px-4 flex items-center justify-between bg-white border-b border-white/10">
        <Image
          src="/NewLogo/Logo.png"
          alt="QR Junction"
          width={80}
          height={30}
          className="h-12 w-auto object-contain"
          priority
        />
        <button
          type="button"
          onClick={() => setNavOpen(false)}
          className="md:hidden p-2 rounded-xl bg-slate-100 border-none cursor-pointer"
          aria-label="Close menu"
        >
          <X className="w-4 h-4 text-[#001B50]" />
        </button>
      </div>
      <nav className="flex-1 min-h-0 overflow-y-auto py-4 px-3 space-y-1">
        {NAV.map((item) => {
          const active =
            item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setNavOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                active ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/10">
        <p className="text-xs text-white/80 truncate">{adminName}</p>
        <p className="text-[10px] uppercase tracking-wider text-white/50 mt-0.5">{adminRole}</p>
        <button
          type="button"
          onClick={async () => {
            await logout();
            router.push("/admin/login");
          }}
          className="mt-3 flex items-center gap-2 text-xs text-white/70 hover:text-white border-none bg-transparent cursor-pointer p-0"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="h-screen overflow-hidden bg-slate-50 flex">
      <aside className="hidden md:flex w-64 h-screen flex-col bg-[#001B50] text-white shrink-0">
        {sidebar}
      </aside>

      {navOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-black/50 border-none cursor-pointer"
            aria-label="Close menu overlay"
            onClick={() => setNavOpen(false)}
          />
          <aside className="relative z-10 h-full w-[min(18rem,86vw)] flex flex-col bg-[#001B50] text-white shadow-2xl">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0 h-screen overflow-y-auto">
        <header className="md:hidden sticky top-0 z-30 h-14 bg-white border-b border-slate-200 px-3 grid grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center">
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            className="p-2 rounded-xl bg-slate-100 border-none cursor-pointer justify-self-start"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-[#001B50]" />
          </button>
          <Image
            src="/NewLogo/Logo.png"
            alt="QR Junction"
            width={80}
            height={30}
            className="h-9 w-auto object-contain justify-self-center"
            priority
          />
        </header>
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
