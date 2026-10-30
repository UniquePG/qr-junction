"use client";

import { SuiteShell, type SuiteNavItem, type SuiteTheme } from "@/components/suites/SuiteShell";
import {
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  QrCode,
  ScanLine,
  Store,
  UtensilsCrossed,
} from "lucide-react";

const theme: SuiteTheme = {
  background: "#F6F1EA",
  sidebar: "#1C1410",
  sidebarBorder: "#3A2C24",
  text: "#2A211C",
  muted: "#C4B5A8",
  accent: "#C4622D",
  accentText: "#fffaf6",
  card: "#ffffff",
  eyebrow: "Restaurant QR",
  title: "Service floor",
};

const items: SuiteNavItem[] = [
  { name: "Home", href: "/dashboard/restaurant", icon: LayoutDashboard, mobile: true },
  { name: "Menus", href: "/dashboard/restaurant/menu", icon: UtensilsCrossed, mobile: true },
  { name: "Tables", href: "/dashboard/restaurant/tables", icon: QrCode, mobile: true },
  { name: "Orders", href: "/dashboard/restaurant/orders", icon: ClipboardList, mobile: true, soon: true, center: true },
  { name: "Profile", href: "/dashboard/restaurant/profile", icon: Store },
  { name: "Scanner", href: "/dashboard/restaurant/scanner", icon: ScanLine },
  { name: "Analytics", href: "/dashboard/restaurant/analytics", icon: BarChart3 },
];

export default function RestaurantSuiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SuiteShell theme={theme} items={items}>
      {children}
    </SuiteShell>
  );
}
