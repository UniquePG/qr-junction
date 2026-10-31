"use client";

import {
  Area,
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type FloorOverview = {
  restaurant: {
    name: string;
    currency: string;
    orderingEnabled: boolean;
    menuCount: number;
    tableCount: number;
  };
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
    unpaidOrders: number;
    rejectedOrders: number;
    rejectedSales: number;
    firstTime: number;
    returning: number;
    items: number;
    openNow: number;
    open: { PLACED: number; ACCEPTED: number; PREPARING: number; READY: number };
    previous: { sales: number; orders: number; scans: number } | null;
  };
  series: { key: string; label: string; sales: number; orders: number; scans: number }[];
  hours: { hour: number; label: string; orders: number }[];
  statuses: { status: string; label: string; count: number }[];
  dishes: { name: string; quantity: number; sales: number }[];
  places: { name: string; orders: number; sales: number }[];
};

const STATUS_COLOR: Record<string, string> = {
  PLACED: "#C4622D",
  ACCEPTED: "#8C6239",
  PREPARING: "#C9A227",
  READY: "#2F6B4F",
  SERVED: "#1C1410",
  REJECTED: "#C4B5A8",
};

export function money(currency: string, value: number) {
  const digits = Math.abs(value) >= 100 || Number.isInteger(value) ? 0 : 2;
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: digits,
    }).format(value);
  } catch {
    return `${currency} ${Math.round(value)}`;
  }
}

function compact(value: number) {
  if (value >= 100000) return `${Math.round(value / 1000)}k`;
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
    <div className="rounded-xl border border-[#E7DDD2] bg-white px-3 py-2 text-xs shadow-sm">
      <p className="font-semibold text-[#1C1410]">{label}</p>
      {payload.map((item) => (
        <p key={item.name} className="mt-1 text-[#6B5A50]">
          <span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ background: item.color }} />
          {item.name}: {item.name === "Sales" ? money(currency, Number(item.value || 0)) : item.value}
        </p>
      ))}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="py-10 text-center text-sm text-[#8A776C]">{text}</p>;
}

function RankList({
  rows,
  currency,
  value,
  detail,
}: {
  rows: { name: string; primary: number; sales: number }[];
  currency: string;
  value: (row: { primary: number }) => string;
  detail: string;
}) {
  const max = rows[0]?.primary || 1;
  if (!rows.length) return <Empty text={`No ${detail} in this range.`} />;
  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <li key={row.name} className="min-w-0">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate font-medium text-[#1C1410]">{row.name}</span>
            <span className="shrink-0 tabular-nums text-[#6B5A50]">{value(row)}</span>
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

export function FloorBoard({ data }: { data: FloorOverview }) {
  const currency = data.restaurant.currency;
  const trend = data.series.some((point) => point.sales > 0 || point.scans > 0 || point.orders > 0);
  const statusSlices = data.statuses.filter((status) => status.count > 0);
  const rush = data.hours.some((hour) => hour.orders > 0);
  const guestTotal = data.summary.firstTime + data.summary.returning;
  const perOrder = data.summary.orders > 0 ? data.summary.items / data.summary.orders : 0;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <section className="min-w-0 rounded-2xl border border-[#E7DDD2] bg-white p-4 sm:p-5 lg:col-span-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-sm font-semibold text-[#1C1410]">Sales and scans</h3>
            <div className="flex gap-3 text-[11px] text-[#6B5A50]">
              <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#C4622D]" /> Sales</span>
              <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#1C1410]" /> Scans</span>
            </div>
          </div>
          {trend ? (
            <div className="mt-3 h-[220px] w-full min-w-0 sm:h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data.series} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#F0E6DC" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: "#8A776C", fontSize: 10 }} tickLine={false} axisLine={false} minTickGap={28} />
                  <YAxis yAxisId="sales" tickFormatter={compact} tick={{ fill: "#8A776C", fontSize: 10 }} tickLine={false} axisLine={false} width={36} />
                  <YAxis yAxisId="scans" orientation="right" tickFormatter={compact} tick={{ fill: "#8A776C", fontSize: 10 }} tickLine={false} axisLine={false} width={28} />
                  <Tooltip content={<Tip currency={currency} />} />
                  <Area yAxisId="sales" type="monotone" dataKey="sales" name="Sales" stroke="#C4622D" fill="#C4622D" fillOpacity={0.16} strokeWidth={2} />
                  <Area yAxisId="scans" type="monotone" dataKey="scans" name="Scans" stroke="#1C1410" fill="#1C1410" fillOpacity={0.05} strokeWidth={1.5} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <Empty text="No sales or scans in this range." />
          )}
        </section>

        <section className="min-w-0 rounded-2xl border border-[#E7DDD2] bg-white p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-[#1C1410]">Order status</h3>
          {statusSlices.length ? (
            <>
              <div className="relative mx-auto h-[200px] w-full max-w-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusSlices} dataKey="count" nameKey="label" innerRadius={54} outerRadius={74} paddingAngle={2} stroke="none">
                      {statusSlices.map((slice) => (
                        <Cell key={slice.status} fill={STATUS_COLOR[slice.status] || "#C4B5A8"} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-xl font-semibold tabular-nums text-[#1C1410]">{statusSlices.reduce((sum, slice) => sum + slice.count, 0)}</p>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-[#8A776C]">Orders</p>
                </div>
              </div>
              <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                {statusSlices.map((slice) => (
                  <li key={slice.status} className="flex min-w-0 items-center justify-between gap-2 text-xs text-[#6B5A50]">
                    <span className="inline-flex min-w-0 items-center gap-1.5">
                      <i className="h-2 w-2 shrink-0 rounded-full" style={{ background: STATUS_COLOR[slice.status] }} />
                      <span className="truncate">{slice.label}</span>
                    </span>
                    <span className="tabular-nums">{slice.count}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <Empty text="No orders in this range." />
          )}
        </section>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <section className="min-w-0 rounded-2xl border border-[#E7DDD2] bg-white p-4 sm:p-5">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-sm font-semibold text-[#1C1410]">Busiest hours</h3>
            <p className="text-[11px] text-[#8A776C]">India time</p>
          </div>
          {rush ? (
            <div className="mt-3 h-[200px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data.hours} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#F0E6DC" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: "#8A776C", fontSize: 10 }} tickLine={false} axisLine={false} interval={3} />
                  <YAxis allowDecimals={false} tick={{ fill: "#8A776C", fontSize: 10 }} tickLine={false} axisLine={false} width={28} />
                  <Tooltip content={<Tip currency={currency} />} />
                  <Bar dataKey="orders" name="Orders" fill="#1C1410" radius={[4, 4, 0, 0]} maxBarSize={18} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <Empty text="No orders in this range." />
          )}
        </section>

        <section className="min-w-0 rounded-2xl border border-[#E7DDD2] bg-white p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-[#1C1410]">Customers</h3>
          {guestTotal || data.summary.rejectedOrders ? (
            <div className="mt-4">
              {guestTotal ? (
                <div className="flex h-3 overflow-hidden rounded-full bg-[#F3EBE3]">
                  <div className="h-full bg-[#1C1410]" style={{ width: `${(data.summary.returning / guestTotal) * 100}%` }} />
                  <div className="h-full bg-[#C4622D]" style={{ width: `${(data.summary.firstTime / guestTotal) * 100}%` }} />
                </div>
              ) : null}
              <ul className="mt-4 grid grid-cols-2 gap-3">
                <li>
                  <p className="text-lg font-semibold tabular-nums text-[#1C1410]">{data.summary.returning}</p>
                  <p className="text-xs text-[#6B5A50]">Came back</p>
                </li>
                <li>
                  <p className="text-lg font-semibold tabular-nums text-[#1C1410]">{data.summary.firstTime}</p>
                  <p className="text-xs text-[#6B5A50]">First order</p>
                </li>
              </ul>
              <p className="mt-4 text-xs leading-5 text-[#6B5A50]">
                {perOrder ? `${perOrder.toFixed(perOrder % 1 === 0 ? 0 : 1)} dishes an order` : "No dishes sold"}
                {data.summary.rejectedOrders
                  ? ` · ${data.summary.rejectedOrders} turned away, ${money(currency, data.summary.rejectedSales)}`
                  : ""}
              </p>
            </div>
          ) : (
            <Empty text="No orders in this range." />
          )}
        </section>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <section className="min-w-0 rounded-2xl border border-[#E7DDD2] bg-white p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-[#1C1410]">Top dishes</h3>
          <div className="mt-4">
            <RankList
              currency={currency}
              detail="dishes"
              rows={data.dishes.map((dish) => ({ name: dish.name, primary: dish.quantity, sales: dish.sales }))}
              value={(row) => `${row.primary} sold`}
            />
          </div>
        </section>
        <section className="min-w-0 rounded-2xl border border-[#E7DDD2] bg-white p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-[#1C1410]">Tables and counter</h3>
          <div className="mt-4">
            <RankList
              currency={currency}
              detail="orders"
              rows={data.places.map((place) => ({ name: place.name, primary: place.orders, sales: place.sales }))}
              value={(row) => `${row.primary} orders`}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
