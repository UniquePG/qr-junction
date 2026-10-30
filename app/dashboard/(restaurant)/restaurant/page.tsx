"use client";

import { useAuth } from "@/components/AuthContext";
import { restaurantService } from "@/lib/api";
import { BarChart3, Loader2, QrCode, Store, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function RestaurantHomePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [menuCount, setMenuCount] = useState(0);
  const [tableCount, setTableCount] = useState(0);
  const [scans, setScans] = useState(0);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function load() {
      try {
        const [profileRes, menusRes, tablesRes, statsRes] = await Promise.all([
          restaurantService.getProfile(),
          restaurantService.listMenus(),
          restaurantService.listTables(),
          restaurantService.stats(),
        ]);
        const profile = profileRes.ok ? await profileRes.json() : null;
        const menus = menusRes.ok ? await menusRes.json() : null;
        const tables = tablesRes.ok ? await tablesRes.json() : null;
        const stats = statsRes.ok ? await statsRes.json() : null;
        if (cancelled) return;
        setName(profile?.restaurant?.name || "");
        setMenuCount(Array.isArray(menus?.menus) ? menus.menus.length : 0);
        setTableCount(Array.isArray(tables?.tables) ? tables.tables.length : 0);
        setScans(Number(stats?.totalScans || stats?.stats?.totalScans || 0));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#C4622D]" />
      </div>
    );
  }

  const cards = [
    { label: "Menus", value: menuCount, href: "/dashboard/restaurant/menu", icon: UtensilsCrossed },
    { label: "Tables", value: tableCount, href: "/dashboard/restaurant/tables", icon: QrCode },
    { label: "Scans, 7 days", value: scans, href: "/dashboard/restaurant/analytics", icon: BarChart3 },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="bg-white border border-[#E7DDD2] rounded-2xl p-5 md:p-6">
        <p className="text-xs uppercase tracking-[0.16em] text-[#8A7568]">Overview</p>
        <h2 className="mt-2 text-2xl font-semibold text-[#2A211C]">
          {name || "Set up your restaurant"}
        </h2>
        <p className="mt-2 text-sm text-[#6B5A50] max-w-xl">
          Menus, table QR codes, and scan activity live here. Orders from the menu will open on this floor when that service is ready.
        </p>
        {!name ? (
          <Link
            href="/dashboard/restaurant/profile"
            className="inline-flex items-center gap-2 mt-4 bg-[#C4622D] text-white text-sm font-semibold px-4 py-2.5 rounded-xl no-underline"
          >
            <Store className="w-4 h-4" />
            Add restaurant profile
          </Link>
        ) : null}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} href={card.href} className="bg-white border border-[#E7DDD2] rounded-2xl p-4 no-underline">
              <Icon className="w-4 h-4 text-[#C4622D]" />
              <p className="mt-3 text-2xl font-semibold text-[#2A211C]">{card.value}</p>
              <p className="text-sm text-[#6B5A50]">{card.label}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
