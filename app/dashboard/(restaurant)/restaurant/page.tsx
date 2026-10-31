"use client";

import { useAuth } from "@/components/AuthContext";
import { FloorBoard, money, type FloorOverview } from "@/components/restaurant/FloorCharts";
import { restaurantService } from "@/lib/api";
import { Loader2, Store } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type RangeKey = "today" | "7" | "30" | "all" | "custom";

const RANGES: { key: Exclude<RangeKey, "custom">; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "7", label: "7 days" },
  { key: "30", label: "30 days" },
  { key: "all", label: "All" },
];

function rangeDates(key: Exclude<RangeKey, "custom">): [Date | null, Date | null] {
  if (key === "all") return [null, null];
  const end = new Date();
  const start = new Date();
  if (key === "today") start.setHours(0, 0, 0, 0);
  else start.setDate(end.getDate() - (key === "7" ? 7 : 30));
  if (key !== "today") start.setHours(0, 0, 0, 0);
  return [start, end];
}

function changeLine(current: number, previous: number | null, format: (value: number) => string) {
  if (previous == null) return null;
  const diff = current - previous;
  if (diff === 0) return "Same as the previous range";
  const sign = diff > 0 ? "+" : "−";
  return `${sign}${format(Math.abs(diff))} vs previous`;
}

export default function RestaurantHomePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<FloorOverview | null>(null);
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState("");
  const [range, setRange] = useState<RangeKey>("7");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  useEffect(() => {
    if (!user) return;
    const [start, end] = rangeDates("7");
    let cancelled = false;
    async function load() {
      try {
        const res = await restaurantService.overview(start, end);
        const json = await res.json().catch(() => null);
        if (cancelled) return;
        if (!res.ok) throw new Error(json?.error || "Could not load the floor.");
        if (!json?.restaurant) {
          setMissing(true);
          setData(null);
          return;
        }
        setError("");
        setData(json as FloorOverview);
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Could not load the floor.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const apply = async (key: RangeKey, start: Date | null, end: Date | null) => {
    setRange(key);
    setRefreshing(true);
    try {
      const res = await restaurantService.overview(start, end);
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error();
      if (!json?.restaurant) {
        setMissing(true);
        setData(null);
        return;
      }
      setMissing(false);
      setData(json as FloorOverview);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#C4622D]" />
      </div>
    );
  }

  if (error || !data) {
    if (!missing) {
      return (
        <div className="mx-auto max-w-xl rounded-2xl border border-[#E7DDD2] bg-white p-6">
          <h2 className="text-lg font-semibold text-[#1C1410]">The overview did not load</h2>
          <p className="mt-2 text-sm text-[#6B5A50]">{error || "Try again in a moment."}</p>
        </div>
      );
    }
  }

  if (missing || !data) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-[#E7DDD2] bg-white p-6">
        <p className="text-xs uppercase tracking-[0.16em] text-[#8A7568]">Overview</p>
        <h2 className="mt-2 text-2xl font-semibold text-[#1C1410]">Set up your restaurant</h2>
        <p className="mt-2 text-sm text-[#6B5A50]">Add the place first. Sales, orders, and menu scans will show here.</p>
        <Link href="/dashboard/restaurant/profile" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#1C1410] px-4 py-2.5 text-sm font-semibold text-white no-underline">
          <Store className="h-4 w-4" />
          Add restaurant profile
        </Link>
      </div>
    );
  }

  const summary = data.summary;
  const previous = summary.previous;
  const cards = [
    {
      label: "Sales",
      value: money(data.restaurant.currency, summary.sales),
      hint: summary.orders ? `${money(data.restaurant.currency, summary.average)} average` : "No orders yet",
      delta: changeLine(summary.sales, previous?.sales ?? null, (value) => money(data.restaurant.currency, value)),
      href: "/dashboard/restaurant/orders",
    },
    {
      label: "Orders",
      value: String(summary.orders),
      hint: summary.customers === 1 ? "1 customer" : `${summary.customers} customers`,
      delta: changeLine(summary.orders, previous?.orders ?? null, (value) => String(Math.round(value))),
      href: "/dashboard/restaurant/orders",
    },
    {
      label: "Menu scans",
      value: String(summary.scans),
      hint: summary.guests === 1 ? "1 guest" : `${summary.guests} guests`,
      delta: changeLine(summary.scans, previous?.scans ?? null, (value) => String(Math.round(value))),
      href: "/dashboard/restaurant/analytics",
    },
    {
      label: "To collect",
      value: money(data.restaurant.currency, summary.unpaid),
      hint: summary.unpaidOrders ? `${summary.unpaidOrders} served, not paid` : `${money(data.restaurant.currency, summary.paid)} paid`,
      delta: null,
      href: "/dashboard/restaurant/orders",
    },
  ];

  return (
    <div className={`mx-auto w-full max-w-6xl space-y-4 ${refreshing ? "opacity-70" : ""}`}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.16em] text-[#8A7568]">Overview</p>
          <h2 className="mt-1 text-2xl font-semibold text-[#1C1410]">How the place is doing</h2>
          <p className="mt-1 text-sm text-[#6B5A50]">
            <Link href="/dashboard/restaurant/menu" className="font-medium text-[#1C1410] no-underline">{data.restaurant.menuCount} {data.restaurant.menuCount === 1 ? "menu" : "menus"}</Link>
            <span> · </span>
            <Link href="/dashboard/restaurant/tables" className="font-medium text-[#1C1410] no-underline">{data.restaurant.tableCount} {data.restaurant.tableCount === 1 ? "table" : "tables"}</Link>
            {data.restaurant.orderingEnabled ? null : <span> · Ordering is off</span>}
          </p>
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap gap-1.5">
            {RANGES.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  const [start, end] = rangeDates(item.key);
                  void apply(item.key, start, end);
                }}
                className={`h-9 rounded-full px-3 text-xs font-semibold ${range === item.key ? "bg-[#1C1410] text-white" : "border border-[#E7DDD2] bg-white text-[#2A211C]"}`}
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setRange("custom")}
              className={`h-9 rounded-full px-3 text-xs font-semibold ${range === "custom" ? "bg-[#1C1410] text-white" : "border border-[#E7DDD2] bg-white text-[#2A211C]"}`}
            >
              Custom
            </button>
          </div>
          {range === "custom" ? (
            <form
              className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
              onSubmit={(event) => {
                event.preventDefault();
                if (!customStart || !customEnd) return;
                const start = new Date(customStart);
                start.setHours(0, 0, 0, 0);
                const end = new Date(customEnd);
                end.setHours(23, 59, 59, 999);
                if (start > end) return;
                void apply("custom", start, end);
              }}
            >
              <input type="date" aria-label="Start date" value={customStart} onChange={(event) => setCustomStart(event.target.value)} className="h-10 min-w-0 rounded-lg border border-[#E7DDD2] bg-white px-2 text-sm text-[#2A211C]" required />
              <input type="date" aria-label="End date" value={customEnd} onChange={(event) => setCustomEnd(event.target.value)} className="h-10 min-w-0 rounded-lg border border-[#E7DDD2] bg-white px-2 text-sm text-[#2A211C]" required />
              <button type="submit" className="h-10 rounded-lg bg-[#C4622D] px-4 text-sm font-semibold text-white">Apply</button>
            </form>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="min-w-0 rounded-2xl border border-[#E7DDD2] bg-white p-3 no-underline sm:p-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#8A776C]">{card.label}</p>
            <p className="mt-2 truncate text-xl font-semibold tabular-nums text-[#1C1410] sm:text-2xl">{card.value}</p>
            <p className="mt-1 truncate text-[11px] text-[#6B5A50] sm:text-xs">{card.hint}</p>
            {card.delta ? <p className="mt-1 truncate text-[11px] text-[#8A776C]">{card.delta}</p> : null}
          </Link>
        ))}
      </div>

      {summary.openNow > 0 ? (
        <Link href="/dashboard/restaurant/orders" className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border border-[#E7DDD2] bg-[#1C1410] px-4 py-3 text-sm text-white no-underline">
          <span className="font-semibold">{summary.openNow} still on the floor</span>
          <span className="text-white/70">Placed {summary.open.PLACED} · Kitchen {summary.open.ACCEPTED + summary.open.PREPARING} · Ready {summary.open.READY}</span>
        </Link>
      ) : null}

      <FloorBoard data={data} />
    </div>
  );
}
