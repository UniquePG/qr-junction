"use client";

import { money } from "@/components/restaurant/FloorCharts";
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type RestaurantAnalytics = {
  restaurant: { currency: string; orderingEnabled: boolean };
  range: { bucket: "hour" | "day" | "week" };
  summary: {
    sales: number;
    orders: number;
    average: number;
    customers: number;
    scans: number;
    guests: number;
    paid: number;
    unpaid: number;
    rejectedOrders: number;
    rejectedSales: number;
    firstTime: number;
    returning: number;
    items: number;
    avgMinutes: number;
    served: number;
  };
  series: { label: string; sales: number; orders: number; scans: number }[];
  weekdays: { label: string; orders: number; sales: number }[];
  hours: { label: string; orders: number; sales: number }[];
  service: { label: string; count: number }[];
  categories: { name: string; quantity: number; sales: number }[];
  dishes: { name: string; quantity: number; sales: number }[];
  diet: { name: string; quantity: number; sales: number }[];
  places: { name: string; scans: number; orders: number; sales: number }[];
};

const DIET_COLOR: Record<string, string> = {
  Veg: "#2F6B4F",
  "Non-veg": "#C4622D",
  Other: "#C4B5A8",
};

function compact(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
  return String(Math.round(value));
}

function Tip({
  active,
  payload,
  label,
  currency,
}: {
  active?: boolean;
  payload?: { name?: string; value?: number; color?: string }[];
  label?: string;
  currency: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="max-w-[220px] rounded-xl border border-[#E7DDD2] bg-white px-3 py-2 text-xs shadow-sm">
      <p className="font-semibold text-[#1C1410]">{label}</p>
      {payload.map((item) => (
        <p key={item.name} className="mt-1 text-[#6B5A50]">
          {item.name}: {item.name === "Sales" ? money(currency, Number(item.value || 0)) : item.value}
        </p>
      ))}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="py-10 text-center text-sm text-[#8A776C]">{text}</p>;
}

function Panel({ title, note, children, className = "" }: { title: string; note?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`min-w-0 rounded-2xl border border-[#E7DDD2] bg-white p-4 sm:p-5 ${className}`}>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-semibold text-[#1C1410]">{title}</h3>
        {note ? <p className="text-[11px] text-[#8A776C]">{note}</p> : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Bars({
  rows,
  currency,
  primary,
  caption,
}: {
  rows: { name: string; primary: number; sales: number }[];
  currency: string;
  primary: (row: { primary: number }) => string;
  caption: string;
}) {
  const max = rows[0]?.primary || 1;
  if (!rows.length) return <Empty text={caption} />;
  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <li key={row.name} className="min-w-0">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate font-medium text-[#1C1410]">{row.name}</span>
            <span className="shrink-0 tabular-nums text-[#6B5A50]">{primary(row)}</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#F3EBE3]">
            <div className="h-full rounded-full bg-[#C4622D]" style={{ width: `${Math.max(6, Math.round((row.primary / max) * 100))}%` }} />
          </div>
          <p className="mt-1 text-[11px] text-[#8A776C]">{money(currency, row.sales)}</p>
        </li>
      ))}
    </ul>
  );
}

export function AnalyticsBoard({ data }: { data: RestaurantAnalytics }) {
  const currency = data.restaurant.currency;
  const trend = data.series.some((point) => point.sales > 0 || point.orders > 0 || point.scans > 0);
  const weekdayLive = data.weekdays.some((day) => day.orders > 0);
  const hourLive = data.hours.some((hour) => hour.orders > 0);
  const dietTotal = data.diet.reduce((sum, row) => sum + row.quantity, 0);

  return (
    <div className="space-y-3">
      <Panel title="Sales through the range" note={data.range.bucket === "hour" ? "By hour" : data.range.bucket === "week" ? "By week" : "By day"}>
        {trend ? (
          <div className="h-[220px] w-full min-w-0 sm:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data.series} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#F0E6DC" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "#8A776C", fontSize: 10 }} tickLine={false} axisLine={false} minTickGap={28} />
                <YAxis yAxisId="sales" tickFormatter={compact} tick={{ fill: "#8A776C", fontSize: 10 }} tickLine={false} axisLine={false} width={36} />
                <YAxis yAxisId="orders" orientation="right" allowDecimals={false} tick={{ fill: "#8A776C", fontSize: 10 }} tickLine={false} axisLine={false} width={24} />
                <Tooltip content={<Tip currency={currency} />} />
                <Bar yAxisId="sales" dataKey="sales" name="Sales" fill="#C4622D" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Line yAxisId="orders" dataKey="orders" name="Orders" stroke="#1C1410" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <Empty text="No sales in this range." />
        )}
      </Panel>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Panel title="Day of the week" note="India time">
          {weekdayLive ? (
            <div className="h-[200px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data.weekdays} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#F0E6DC" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: "#8A776C", fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tickFormatter={compact} tick={{ fill: "#8A776C", fontSize: 10 }} tickLine={false} axisLine={false} width={36} />
                  <Tooltip content={<Tip currency={currency} />} />
                  <Bar dataKey="sales" name="Sales" fill="#1C1410" radius={[4, 4, 0, 0]} maxBarSize={28} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <Empty text="No orders in this range." />
          )}
        </Panel>
        <Panel title="When orders arrive" note="India time">
          {hourLive ? (
            <div className="h-[200px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data.hours} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#F0E6DC" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: "#8A776C", fontSize: 10 }} tickLine={false} axisLine={false} interval={3} />
                  <YAxis allowDecimals={false} tick={{ fill: "#8A776C", fontSize: 10 }} tickLine={false} axisLine={false} width={28} />
                  <Tooltip content={<Tip currency={currency} />} />
                  <Bar dataKey="orders" name="Orders" fill="#C4622D" radius={[4, 4, 0, 0]} maxBarSize={16} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <Empty text="No orders in this range." />
          )}
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Panel title="How long plates took" note="Placed until served">
          {data.service.length ? (
            <div className="h-[200px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data.service} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#F0E6DC" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: "#8A776C", fontSize: 10 }} tickLine={false} axisLine={false} interval={0} />
                  <YAxis allowDecimals={false} tick={{ fill: "#8A776C", fontSize: 10 }} tickLine={false} axisLine={false} width={28} />
                  <Tooltip content={<Tip currency={currency} />} />
                  <Bar dataKey="count" name="Plates" fill="#1C1410" radius={[4, 4, 0, 0]} maxBarSize={36} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <Empty text="Service time shows once plates are marked served." />
          )}
        </Panel>
        <Panel title="Veg and non-veg">
          {dietTotal ? (
            <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-[160px_minmax(0,1fr)]">
              <div className="mx-auto h-[160px] w-full max-w-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.diet} dataKey="quantity" nameKey="name" innerRadius={42} outerRadius={64} stroke="none">
                      {data.diet.map((slice) => (
                        <Cell key={slice.name} fill={DIET_COLOR[slice.name] || "#C4B5A8"} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="space-y-2">
                {data.diet.map((slice) => (
                  <li key={slice.name} className="flex min-w-0 items-center justify-between gap-3 text-sm">
                    <span className="inline-flex min-w-0 items-center gap-2 text-[#1C1410]">
                      <i className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: DIET_COLOR[slice.name] || "#C4B5A8" }} />
                      <span className="truncate">{slice.name}</span>
                    </span>
                    <span className="shrink-0 tabular-nums text-[#6B5A50]">{slice.quantity} · {money(currency, slice.sales)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <Empty text="No dishes sold in this range." />
          )}
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Panel title="Categories">
          <Bars
            currency={currency}
            caption="No category sales in this range."
            rows={data.categories.map((row) => ({ name: row.name, primary: row.quantity, sales: row.sales }))}
            primary={(row) => `${row.primary} sold`}
          />
        </Panel>
        <Panel title="Dishes">
          <Bars
            currency={currency}
            caption="No dishes sold in this range."
            rows={data.dishes.map((row) => ({ name: row.name, primary: row.quantity, sales: row.sales }))}
            primary={(row) => `${row.primary} sold`}
          />
        </Panel>
      </div>

      <Panel title="Tables and the menu QR" note="Scans beside what was ordered">
        {data.places.length ? (
          <ul className="space-y-3">
            {data.places.map((place) => (
              <li key={place.name} className="min-w-0 border-b border-[#F3EBE3] pb-3 last:border-0 last:pb-0">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 truncate text-sm font-medium text-[#1C1410]">{place.name}</span>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-[#1C1410]">{money(currency, place.sales)}</span>
                </div>
                <p className="mt-1 text-[11px] text-[#6B5A50]">
                  {place.scans} scans · {place.orders} orders
                  {place.orders > 0 ? ` · ${money(currency, place.sales / place.orders)} average` : ""}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <Empty text="No table or menu activity in this range." />
        )}
      </Panel>
    </div>
  );
}
