"use client";

import { SuiteShell, type SuiteNavItem, type SuiteTheme } from "@/components/suites/SuiteShell";
import { BarChart3, Inbox, LayoutDashboard, QrCode } from "lucide-react";

const theme: SuiteTheme = {
  background: "#F4F6F8",
  sidebar: "#0E1C33",
  sidebarBorder: "#1E3354",
  text: "#102033",
  muted: "#8EA0B8",
  accent: "#0046a1",
  accentText: "#ffffff",
  card: "#ffffff",
  eyebrow: "Review QR",
  title: "Reputation",
};

const items: SuiteNavItem[] = [
  { name: "Home", href: "/dashboard/reviews", icon: LayoutDashboard, mobile: true },
  {
    name: "Campaigns",
    href: "/dashboard/reviews/campaigns",
    icon: QrCode,
    mobile: true,
    match: ["/dashboard/reviews/campaigns", "/dashboard/reviews/new", "/dashboard/reviews/edit"],
  },
  { name: "Inbox", href: "/dashboard/reviews/inbox", icon: Inbox, mobile: true, center: true },
  { name: "Insights", href: "/dashboard/reviews/insights", icon: BarChart3, mobile: true },
];

export default function ReviewSuiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SuiteShell theme={theme} items={items}>
      {children}
    </SuiteShell>
  );
}
