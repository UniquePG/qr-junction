"use client";

import { useAuth } from "@/components/AuthContext";
import { OrderAlertsProvider } from "@/components/orders/OrderAlerts";
import { restaurantService } from "@/lib/api/services/restaurant";
import { SuiteShell, type SuiteNavItem, type SuitePlace, type SuiteTheme } from "@/components/suites/SuiteShell";
import { RESTAURANT_PROFILE_EVENT } from "@/lib/restaurant/events";
import { restaurantKeys } from "@/lib/restaurant/queryKeys";
import { hasPermission, NAV_PERMISSION, type StaffPermissionKey } from "@/lib/restaurant/staff/permissions";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  CreditCard,
  ClipboardList,
  LayoutDashboard,
  Percent,
  QrCode,
  ScanLine,
  ScrollText,
  Settings,
  Store,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
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

const ALL_ITEMS: SuiteNavItem[] = [
  { name: "Home", href: "/dashboard/restaurant", icon: LayoutDashboard, mobile: true },
  { name: "Menus", href: "/dashboard/restaurant/menu", icon: UtensilsCrossed, mobile: true },
  { name: "Offers", href: "/dashboard/restaurant/offers", icon: Percent },
  { name: "Tables", href: "/dashboard/restaurant/tables", icon: QrCode, mobile: true },
  { name: "Orders", href: "/dashboard/restaurant/orders", icon: ClipboardList, mobile: true, center: true },
  { name: "Staff", href: "/dashboard/restaurant/staff", icon: Users },
  { name: "Logs", href: "/dashboard/restaurant/logs", icon: ScrollText },
  { name: "Profile", href: "/dashboard/restaurant/profile", icon: Store },
  { name: "Settings", href: "/dashboard/restaurant/settings", icon: Settings },
  { name: "Scanner", href: "/dashboard/restaurant/scanner", icon: ScanLine },
  { name: "Analytics", href: "/dashboard/restaurant/analytics", icon: BarChart3 },
  { name: "Plan", href: "/dashboard/restaurant/billing", icon: CreditCard },
];

function canSeeNav(permissions: string[] | "ALL" | null | undefined, href: string) {
  if (permissions === "ALL" || permissions == null) return true;
  const key = NAV_PERMISSION[href] as StaffPermissionKey | undefined;
  if (!key) return true;
  return hasPermission(permissions, key);
}

/** Longest matching nav href for the current path (e.g. /staff/roles → /staff). */
function navHrefForPath(pathname: string): string | null {
  const matches = Object.keys(NAV_PERMISSION)
    .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b.length - a.length);
  return matches[0] || null;
}

export default function RestaurantSuiteLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const profileQuery = useQuery({
    queryKey: [...restaurantKeys.profile(), "shell"] as const,
    staleTime: 120_000,
    queryFn: async () => {
      const res = await restaurantService.getProfile({ fields: "shell" });
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

  const permissions = user?.restaurantAccess?.permissions ?? "ALL";
  const canProfile = canSeeNav(permissions, "/dashboard/restaurant/profile");

  const place: SuitePlace = useMemo(() => {
    const href = canProfile ? "/dashboard/restaurant/profile" : "/dashboard/restaurant";
    if (profileQuery.data) {
      return { ...placeFromRestaurant(profileQuery.data), href };
    }
    return {
      name: user?.restaurantAccess?.restaurantName?.trim() || "Restaurant",
      logoUrl: null,
      detail: "Restaurant",
      href,
    };
  }, [profileQuery.data, canProfile, user?.restaurantAccess?.restaurantName]);

  const items = useMemo(
    () => ALL_ITEMS.filter((item) => canSeeNav(permissions, item.href)),
    [permissions],
  );

  const showWaiter =
    permissions === "ALL" || hasPermission(permissions, "waiter.view");

  const deniedPath =
    !authLoading &&
    user?.restaurantAccess?.kind === "staff" &&
    (() => {
      const href = navHrefForPath(pathname || "");
      return href ? !canSeeNav(permissions, href) : false;
    })();

  useEffect(() => {
    if (deniedPath) router.replace("/dashboard/restaurant");
  }, [deniedPath, router]);

  if (deniedPath) {
    return (
      <OrderAlertsProvider>
        <SuiteShell theme={theme} items={items} place={place} showWaiterControl={showWaiter}>
          <p className="text-sm text-[#6B5A50]">You do not have access to this page.</p>
        </SuiteShell>
      </OrderAlertsProvider>
    );
  }

  return (
    <OrderAlertsProvider>
      <SuiteShell theme={theme} items={items} place={place} showWaiterControl={showWaiter}>
        {children}
      </SuiteShell>
    </OrderAlertsProvider>
  );
}
