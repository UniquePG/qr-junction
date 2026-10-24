"use client";

import { useAuth } from "@/components/AuthContext";
import { adminFetch } from "@/lib/adminClient";
import {
  Fingerprint,
  FolderOpen,
  Globe,
  Layout,
  LayoutDashboard,
  Loader2,
  LogOut,
  QrCode,
  Star,
  Users,
  Utensils,
  UserRound,
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

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/admin/login");
      return;
    }

    let cancelled = false;
    adminFetch<{ admin: { name: string | null; email: string; role: string } }>("/api/admin/me")
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

  if (loading || !ready) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-slate-50 flex">
      <aside className="hidden md:flex w-64 h-screen flex-col bg-[#001B50] text-white shrink-0">
        <div className="h-[72px] px-4 flex items-center bg-white border-b border-white/10">
          <Image
            src="/NewLogo/Logo.png"
            alt="QR Junction"
            width={80}
            height={30}
            className="h-12 w-auto object-contain"
            priority
          />
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
            className="mt-3 flex items-center gap-2 text-xs text-white/70 hover:text-white"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 h-screen overflow-y-auto">
        <header className="md:hidden h-14 bg-white border-b border-slate-200 px-4 flex items-center">
          <Image
            src="/NewLogo/Logo.png"
            alt="QR Junction"
            width={80}
            height={30}
            className="h-10 w-auto object-contain"
            priority
          />
        </header>
        <div className="md:hidden overflow-x-auto bg-white border-b border-slate-200">
          <div className="flex gap-2 px-3 py-2">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap text-xs px-3 py-1.5 rounded-full ${
                  pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
                    ? "bg-[#001B50] text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
