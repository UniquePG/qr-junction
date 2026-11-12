"use client";

import { OrderAlertsProvider } from "@/components/orders/OrderAlerts";
import { restaurantService } from "@/lib/api/services/restaurant";
import { SuiteShell, type SuiteNavItem, type SuitePlace, type SuiteTheme } from "@/components/suites/SuiteShell";
import { RESTAURANT_PROFILE_EVENT } from "@/lib/restaurant/events";
import { restaurantKeys } from "@/lib/restaurant/queryKeys";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  CreditCard,
  ClipboardList,
  LayoutDashboard,
  QrCode,
  ScanLine,
  Settings,
  Store,
  UtensilsCrossed,
} from "lucide-react";
import { useEffect, useMemo } from "react";

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
  { name: "Settings", href: "/dashboard/restaurant/settings", icon: Settings },
  { name: "Scanner", href: "/dashboard/restaurant/scanner", icon: ScanLine },
  { name: "Analytics", href: "/dashboard/restaurant/analytics", icon: BarChart3 },
  { name: "Plan", href: "/dashboard/restaurant/billing", icon: CreditCard },
];

export default function RestaurantSuiteLayout({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const profileQuery = useQuery({
    queryKey: restaurantKeys.profile(),
    staleTime: 120_000,
    queryFn: async () => {
      const res = await restaurantService.getProfile();
      const json = (res.data?.restaurant ? res.data : await res.json().catch(() => null)) as {
        restaurant?: Parameters<typeof placeFromRestaurant>[0];
      } | null;
      if (!res.ok) throw new Error("Failed to load restaurant profile");
      return json?.restaurant ?? null;
    },
  });

  useEffect(() => {
    const onProfile = () => {
      void queryClient.invalidateQueries({ queryKey: restaurantKeys.profile() });
    };
    window.addEventListener(RESTAURANT_PROFILE_EVENT, onProfile);
    return () => window.removeEventListener(RESTAURANT_PROFILE_EVENT, onProfile);
  }, [queryClient]);

  const place: SuitePlace = useMemo(() => {
    if (profileQuery.data) return placeFromRestaurant(profileQuery.data);
    return {
      name: "Restaurant",
      logoUrl: null,
      detail: "Restaurant",
      href: "/dashboard/restaurant/profile",
    };
  }, [profileQuery.data]);

  return (
    <OrderAlertsProvider>
      <SuiteShell theme={theme} items={items} place={place}>
        {children}
      </SuiteShell>
    </OrderAlertsProvider>
  );
}
