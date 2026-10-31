"use client";

import { OrderAlertsProvider } from "@/components/orders/OrderAlerts";
import { restaurantService } from "@/lib/api/services/restaurant";
import { SuiteShell, type SuiteNavItem, type SuitePlace, type SuiteTheme } from "@/components/suites/SuiteShell";
import {
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  QrCode,
  ScanLine,
  Store,
  UtensilsCrossed,
} from "lucide-react";
import { useEffect, useState } from "react";

export const RESTAURANT_PROFILE_EVENT = "qrj-restaurant-profile";

const theme: SuiteTheme = {
  background: "#F6F1EA",
  sidebar: "#1C1410",
  sidebarBorder: "#3A2C24",
  text: "#2A211C",
  muted: "#C4B5A8",
  accent: "#C4622D",
  accentText: "#fffaf6",
  card: "#ffffff",
  eyebrow: "Restaurant",
  title: "Restaurant",
};

function placeFromRestaurant(restaurant: {
  name?: string | null;
  logoUrl?: string | null;
  venueType?: string | null;
  city?: string | null;
}): SuitePlace {
  const detail = [restaurant.venueType, restaurant.city]
    .map((part) => (typeof part === "string" ? part.trim() : ""))
    .filter(Boolean)
    .join(" · ");
  return {
    name: restaurant.name?.trim() || "Restaurant",
    logoUrl: restaurant.logoUrl || null,
    detail: detail || "Restaurant",
    href: "/dashboard/restaurant/profile",
  };
}

const items: SuiteNavItem[] = [
  { name: "Home", href: "/dashboard/restaurant", icon: LayoutDashboard, mobile: true },
  { name: "Menus", href: "/dashboard/restaurant/menu", icon: UtensilsCrossed, mobile: true },
  { name: "Tables", href: "/dashboard/restaurant/tables", icon: QrCode, mobile: true },
  { name: "Orders", href: "/dashboard/restaurant/orders", icon: ClipboardList, mobile: true, center: true },
  { name: "Profile", href: "/dashboard/restaurant/profile", icon: Store },
  { name: "Scanner", href: "/dashboard/restaurant/scanner", icon: ScanLine },
  { name: "Analytics", href: "/dashboard/restaurant/analytics", icon: BarChart3 },
];

export default function RestaurantSuiteLayout({ children }: { children: React.ReactNode }) {
  const [place, setPlace] = useState<SuitePlace>({
    name: "Restaurant",
    logoUrl: null,
    detail: "Restaurant",
    href: "/dashboard/restaurant/profile",
  });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await restaurantService.getProfile();
        const json = (await res.json().catch(() => null)) as {
          restaurant?: Parameters<typeof placeFromRestaurant>[0];
        } | null;
        const restaurant = json?.restaurant;
        if (!res.ok || cancelled || !restaurant) return;
        setPlace(placeFromRestaurant(restaurant));
      } catch {
        // The header keeps the quiet restaurant label until the profile loads.
      }
    };
    void load();
    window.addEventListener(RESTAURANT_PROFILE_EVENT, load);
    return () => {
      cancelled = true;
      window.removeEventListener(RESTAURANT_PROFILE_EVENT, load);
    };
  }, []);

  return (
    <OrderAlertsProvider>
      <SuiteShell theme={theme} items={items} place={place}>
        {children}
      </SuiteShell>
    </OrderAlertsProvider>
  );
}
