"use client";

import { useAuth } from "@/components/AuthContext";
import type { RestaurantAnalytics } from "@/components/restaurant/AnalyticsBoard";
import { money } from "@/components/restaurant/FloorCharts";
import { restaurantService } from "@/lib/api";
import { restaurantKeys } from "@/lib/restaurant/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

const AnalyticsBoard = dynamic(
  () => import("@/components/restaurant/AnalyticsBoard").then((mod) => mod.AnalyticsBoard),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[12rem] items-center justify-center rounded-2xl border border-[#E7DDD2] bg-white">
        <Loader2 className="h-6 w-6 animate-spin text-[#C4622D]" />
      </div>
    ),
  },
);

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

function minutes(value: number) {
  if (!value) return "—";
  return value >= 10 ? `${Math.round(value)} min` : `${value.toFixed(1)} min`;
}

function rangeStamp(start: Date | null, end: Date | null) {
  return `${start?.toISOString() || "all"}:${end?.toISOString() || "all"}`;
}

async function loadStats(start: Date | null, end: Date | null) {
  const res = await restaurantService.stats(start, end);
  const json = (await res.json().catch(() => null)) as
    | RestaurantAnalytics
    | { message?: string; error?: string }
    | null;
  if (!res.ok || !(json as RestaurantAnalytics | null)?.restaurant) {
    throw new Error(
      (json as { message?: string; error?: string } | null)?.message ||
        (json as { error?: string } | null)?.error ||
        "Could not load analytics.",
    );
  }
  return json as RestaurantAnalytics;
}

export default function RestaurantAnalyticsPage() {
  const { user } = useAuth();
  const [range, setRange] = useState<RangeKey>("7");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const initial = useMemo(() => rangeDates("7"), []);
  const [bounds, setBounds] = useState<{ start: Date | null; end: Date | null }>({
    start: initial[0],
    end: initial[1],
  });

  const statsQuery = useQuery({
    queryKey: restaurantKeys.stats(rangeStamp(bounds.start, bounds.end), range),
    enabled: Boolean(user),
    staleTime: 60_000,
    queryFn: () => loadStats(bounds.start, bounds.end),
  });

  const apply = (key: RangeKey, start: Date | null, end: Date | null) => {
    setRange(key);
    setBounds({ start, end });
  };

  if (!user || statsQuery.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#C4622D]" />
      </div>
    );
  }

  const error = statsQuery.error instanceof Error ? statsQuery.error.message : "";
  const data = statsQuery.data;

  if (error && !data) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-[#E7DDD2] bg-white p-6">
        <h2 className="text-lg font-semibold text-[#1C1410]">Analytics did not load</h2>
        <p className="mt-2 text-sm text-[#6B5A50]">{error}</p>
        <a href="/dashboard/restaurant/billing" className="mt-4 inline-block text-sm font-semibold text-[#C4622D]">See your plan</a>
      </div>
    );
  }

  if (!data) return null;

  const summary = data.summary;
  const perOrder = summary.orders > 0 ? summary.items / summary.orders : 0;
  const cards = [
    {
      label: "Sales",
      value: money(data.restaurant.currency, summary.sales),
      hint: summary.orders ? `${money(data.restaurant.currency, summary.average)} average ticket` : "No orders yet",
    },
    {
      label: "Orders",
      value: String(summary.orders),
      hint: `${summary.returning} came back · ${summary.firstTime} first time`,
    },
    {
      label: "Serve time",
      value: minutes(summary.avgMinutes),
      hint: summary.served ? `${summary.served} plates marked served` : "No served plates in this range",
    },
    {
      label: "Menu scans",
      value: String(summary.scans),
      hint: summary.unpaid > 0
        ? `${money(data.restaurant.currency, summary.unpaid)} still to collect`
        : `${summary.guests} guests · ${money(data.restaurant.currency, summary.paid)} paid`,
    },
  ];

  return (
    <div className={`mx-auto w-full max-w-6xl space-y-4 ${statsQuery.isFetching ? "opacity-70" : ""}`}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.16em] text-[#8A7568]">Analytics</p>
          <h2 className="mt-1 text-2xl font-semibold text-[#1C1410]">How the business is moving</h2>
          <p className="mt-1 text-sm text-[#6B5A50]">
            {perOrder ? `${perOrder.toFixed(perOrder % 1 === 0 ? 0 : 1)} dishes an order` : "Sales, pace, and what each table is doing"}
            {summary.rejectedOrders ? ` · ${summary.rejectedOrders} turned away (${money(data.restaurant.currency, summary.rejectedSales)})` : ""}
            {data.restaurant.orderingEffective === false
              ? data.restaurant.orderingReason === "OWNER_PAUSED"
                ? " · Not accepting orders"
                : " · Ordering is off"
              : data.restaurant.orderingEnabled
                ? ""
                : " · Ordering is off"}
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
                  apply(item.key, start, end);
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
                apply("custom", start, end);
              }}
            >
              <input type="date" aria-label="Start date" value={customStart} onChange={(event) => setCustomStart(event.target.value)} className="h-10 min-w-0 rounded-lg border border-[#E7DDD2] bg-white px-2 text-sm" required />
              <input type="date" aria-label="End date" value={customEnd} onChange={(event) => setCustomEnd(event.target.value)} className="h-10 min-w-0 rounded-lg border border-[#E7DDD2] bg-white px-2 text-sm" required />
              <button type="submit" className="h-10 rounded-lg bg-[#C4622D] px-4 text-sm font-semibold text-white">Apply</button>
            </form>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="min-w-0 rounded-2xl border border-[#E7DDD2] bg-white p-3 sm:p-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#8A776C]">{card.label}</p>
            <p className="mt-2 truncate text-xl font-semibold tabular-nums text-[#1C1410] sm:text-2xl">{card.value}</p>
            <p className="mt-1 text-[11px] leading-4 text-[#6B5A50] sm:text-xs">{card.hint}</p>
          </div>
        ))}
      </div>

      <AnalyticsBoard data={data} />
    </div>
  );
}
