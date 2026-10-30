"use client";

import { Eye } from "lucide-react";
import { useOrderAlerts } from "@/components/orders/OrderAlerts";
import { restaurantService } from "@/lib/api";
import { waitLabel } from "@/lib/orders/eta";
import { customerStatusCopy, ownerStage } from "@/lib/orders/status";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

type OrderItem = {
  name: string;
  variantLabel: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

type Ticket = {
  publicId: string;
  status: string;
  tableNumber: string | null;
  menuId: number;
  menuName: string;
  customerName: string;
  customerPublicId: string;
  subtotal: number;
  tax: number;
  taxName: string;
  total: number;
  currency: string;
  rejectReason: string | null;
  stageDueAt: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  events?: Array<{ status: string; createdAt: string }>;
  items: OrderItem[];
  history?: Ticket[];
};

type TableRow = { tableNumber: string; menu?: { name?: string | null } | null };
type MenuRow = { id: number; name: string };

type Spot = {
  key: string;
  title: string;
  subtitle: string;
  orders: Ticket[];
};

const ACTIVE = ["PLACED", "ACCEPTED", "PREPARING", "READY"];

function money(currency: string, value: number) {
  const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : "₹";
  return `${symbol}${Number(value).toFixed(2)}`;
}

function placeLabel(tableNumber: string | null) {
  if (!tableNumber) return "Counter";
  return /^table\b/i.test(tableNumber) ? tableNumber : `Table ${tableNumber}`;
}

function whenLabel(iso: string | null | undefined) {
  if (!iso) return "";
  return new Date(iso).toLocaleString([], { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

function eventTime(order: Ticket, status: string) {
  return order.events?.find((event) => event.status === status)?.createdAt || null;
}

function counts(orders: Ticket[]) {
  return {
    fresh: orders.filter((order) => order.status === "PLACED").length,
    cooking: orders.filter((order) => order.status === "ACCEPTED" || order.status === "PREPARING").length,
    ready: orders.filter((order) => order.status === "READY").length,
  };
}

function buildSpots(tables: TableRow[], menus: MenuRow[], orders: Ticket[]): Spot[] {
  const active = orders.filter((order) => ACTIVE.includes(order.status));
  if (tables.length > 0) {
    const known = new Set(tables.map((table) => table.tableNumber));
    const spots: Spot[] = tables.map((table) => ({
      key: `table:${table.tableNumber}`,
      title: placeLabel(table.tableNumber),
      subtitle: table.menu?.name || "",
      orders: active.filter((order) => order.tableNumber === table.tableNumber),
    }));
    const counter = active.filter((order) => !order.tableNumber);
    if (counter.length) {
      spots.push({ key: "counter", title: "Counter", subtitle: "Menu scan", orders: counter });
    }
    const strayLabels = [...new Set(
      active
        .map((order) => order.tableNumber)
        .filter((label): label is string => typeof label === "string" && label.length > 0)
        .filter((label) => !known.has(label)),
    )];
    strayLabels.forEach((label) => {
      spots.push({
        key: `stray:${label}`,
        title: placeLabel(label),
        subtitle: "",
        orders: active.filter((order) => order.tableNumber === label),
      });
    });
    return spots;
  }

  const spots = menus.map((menu) => ({
    key: `menu:${menu.id}`,
    title: menu.name,
    subtitle: "Menu",
    orders: active.filter((order) => order.menuId === menu.id),
  }));
  const knownMenus = new Set(menus.map((menu) => menu.id));
  active.filter((order) => !knownMenus.has(order.menuId)).forEach((order) => {
    const key = `menu:${order.menuId}`;
    const found = spots.find((spot) => spot.key === key);
    if (found) found.orders.push(order);
    else spots.push({ key, title: order.menuName || "Menu", subtitle: "Menu", orders: [order] });
  });
  if (spots.length === 0) {
    spots.push({ key: "counter", title: "Counter", subtitle: "Menu", orders: active });
  }
  return spots;
}

function KitchenTimeCard({ draft, onChange, onSave }: { draft: string; onChange: (value: string) => void; onSave: () => void }) {
  return (
    <div className="w-full rounded-2xl border border-[#E7DDD2] bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-[#2A211C]">Usual kitchen time</p>
      <p className="mt-1 text-xs leading-relaxed text-[#6B5A50]">Used as the starting wait for a new plate. Change it when the kitchen’s pace changes.</p>
      <div className="mt-3 flex items-center gap-2">
        <input inputMode="numeric" value={draft} onChange={(event) => onChange(event.target.value.replace(/[^\d]/g, "").slice(0, 3))} className="h-10 w-16 rounded-xl border border-[#E7DDD2] px-3 text-sm" aria-label="Usual kitchen time in minutes" />
        <span className="text-sm text-[#6B5A50]">min</span>
        <button type="button" onClick={onSave} className="h-10 cursor-pointer rounded-xl border-none bg-[#1C1410] px-4 text-sm font-semibold text-white">Save</button>
      </div>
    </div>
  );
}

export default function RestaurantOrdersPage() {
  const alerts = useOrderAlerts();
  const [orders, setOrders] = useState<Ticket[]>([]);
  const [tables, setTables] = useState<TableRow[]>([]);
  const [menus, setMenus] = useState<MenuRow[]>([]);
  const [unpaidCount, setUnpaidCount] = useState(0);
  const [orderingEnabled, setOrderingEnabled] = useState(true);
  const [view, setView] = useState<"floor" | "payments">("floor");
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [historyFor, setHistoryFor] = useState<Ticket | null>(null);
  const [history, setHistory] = useState<Ticket[]>([]);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState("");
  const [servedNote, setServedNote] = useState("");
  const [prepDraft, setPrepDraft] = useState("12");
  const [prepReady, setPrepReady] = useState(false);
  const [prepOpen, setPrepOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const load = useCallback(async () => {
    const [orderResult, tableResult, menuResult] = await Promise.all([
      restaurantService.listOrders(),
      restaurantService.listTables(),
      restaurantService.listMenus(),
    ]);
    if (orderResult.ok) {
      setOrders(orderResult.data.orders || []);
      setUnpaidCount(Number(orderResult.data.unpaidCount || 0));
      setOrderingEnabled(Boolean(orderResult.data.orderingEnabled));
      if (!prepReady && typeof orderResult.data.prepMinutes === "number") {
        setPrepDraft(String(orderResult.data.prepMinutes));
        setPrepReady(true);
      }
    }
    if (tableResult.ok) {
      const body = await tableResult.json();
      setTables(Array.isArray(body.tables) ? body.tables : []);
    }
    if (menuResult.ok) {
      const body = await menuResult.json();
      setMenus(Array.isArray(body.menus) ? body.menus : []);
    }
  }, [prepReady]);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 4000);
    const clock = window.setInterval(() => setNow(Date.now()), 15000);
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      void Notification.requestPermission();
    }
    return () => {
      window.clearInterval(timer);
      window.clearInterval(clock);
    };
  }, [load, alerts.placedCount]);

  const spots = useMemo(() => buildSpots(tables, menus, orders), [tables, menus, orders]);
  const openSpot = spots.find((spot) => spot.key === openKey) || null;

  const move = async (publicId: string, status: string, note?: string) => {
    setBusy(publicId + status);
    const result = await restaurantService.updateOrder(publicId, { status, reason: note });
    setBusy("");
    if (!result.ok) return;
    setRejecting(null);
    setReason("");
    if (status === "SERVED") setServedNote("Plate served. It is waiting in Payments.");
    await load();
  };

  const savePrep = async () => {
    const result = await restaurantService.updatePrep(Math.round(Number(prepDraft)));
    if (result.ok) {
      setPrepDraft(String(result.data.prepMinutes));
      setPrepOpen(false);
    }
  };

  const saveStage = async (publicId: string, minutes: number) => {
    const result = await restaurantService.updateOrder(publicId, { stageMinutes: minutes });
    if (result.ok) await load();
  };

  const openHistory = async (order: Ticket) => {
    setHistoryFor(order);
    setHistory([]);
    const result = await restaurantService.getOrder(order.publicId);
    setHistory(result.ok ? result.data.order?.history || [] : []);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.16em] text-[#C4622D]">Kitchen</p>
          <h2 className="mt-1 text-2xl font-semibold text-[#2A211C]">{view === "floor" ? (tables.length ? "Tables" : "Menus") : "Payments"}</h2>
          {!orderingEnabled ? <p className="mt-2 text-sm text-[#6B5A50]">Ordering is off for this restaurant. An admin can turn it on.</p> : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl bg-[#F3EBE3] p-1">
            <button type="button" onClick={() => setView("floor")} className={`h-9 cursor-pointer rounded-lg border-none px-3 text-sm font-semibold ${view === "floor" ? "bg-white text-[#1C1410] shadow-sm" : "bg-transparent text-[#6B5A50]"}`}>Orders</button>
            <button type="button" onClick={() => { setView("payments"); setServedNote(""); }} className={`relative h-9 cursor-pointer rounded-lg border-none px-3 text-sm font-semibold ${view === "payments" ? "bg-white text-[#1C1410] shadow-sm" : "bg-transparent text-[#6B5A50]"}`}>
              Payments
              {unpaidCount > 0 ? <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#C4622D] px-1 text-[11px] font-bold text-white">{unpaidCount}</span> : null}
            </button>
          </div>
          <div className="relative">
            <button type="button" onClick={() => setPrepOpen((open) => !open)} className="h-10 cursor-pointer rounded-xl border border-[#E7DDD2] bg-white px-3 text-sm font-semibold text-[#2A211C]" aria-expanded={prepOpen}>
              Kitchen time · {prepDraft || "12"} min
            </button>
            {prepOpen ? (
              <div className="absolute right-0 z-20 mt-2 hidden w-72 sm:block">
                <KitchenTimeCard draft={prepDraft} onChange={setPrepDraft} onSave={() => void savePrep()} />
              </div>
            ) : null}
          </div>
        </div>
      </div>
      {prepOpen ? (
        <div className="sm:hidden">
          <KitchenTimeCard draft={prepDraft} onChange={setPrepDraft} onSave={() => void savePrep()} />
        </div>
      ) : null}

      {servedNote && view === "floor" ? (
        <button type="button" onClick={() => { setView("payments"); setServedNote(""); }} className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border border-[#E8C4AE] bg-[#FFF8F3] px-4 py-3 text-left">
          <span className="text-sm font-semibold text-[#2A211C]">{servedNote}</span>
          <span className="shrink-0 text-sm font-semibold text-[#C4622D]">Open payments</span>
        </button>
      ) : null}

      {view === "floor" ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {spots.map((spot) => {
            const summary = counts(spot.orders);
            const clear = spot.orders.length === 0;
            const needsAction = summary.fresh > 0;
            const tone = clear ? "bg-[#1F7A4D] text-white" : needsAction ? "bg-[#C4622D] text-white" : "bg-[#1C1410] text-white";
            const total = spot.orders.reduce((sum, order) => sum + order.total, 0);
            const bits = [
              summary.fresh ? `${summary.fresh} new` : "",
              summary.cooking ? `${summary.cooking} cooking` : "",
              summary.ready ? `${summary.ready} ready` : "",
            ].filter(Boolean);
            return (
              <button key={spot.key} type="button" onClick={() => setOpenKey(spot.key)} className={`flex min-h-28 cursor-pointer flex-col items-start justify-between rounded-2xl border-none p-3 text-left shadow-sm ${tone}`}>
                <span className="w-full">
                  <span className="block truncate text-base font-semibold">{spot.title}</span>
                  {spot.subtitle ? <span className="mt-0.5 block truncate text-[11px] opacity-80">{spot.subtitle}</span> : null}
                </span>
                <span className="mt-3 w-full">
                  <span className="block text-sm font-semibold">{clear ? "Clear" : money(spot.orders[0]?.currency || "INR", total)}</span>
                  <span className="mt-0.5 block text-[11px] leading-snug opacity-90">{clear ? "No plates" : bits.join(" · ")}</span>
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <PaymentsBoard tables={tables} menus={menus} />
      )}

      {openSpot ? (
        <TableDrawer
          spot={openSpot}
          now={now}
          busy={busy}
          rejecting={rejecting}
          reason={reason}
          onClose={() => { setOpenKey(null); setRejecting(null); }}
          onReason={setReason}
          onReject={setRejecting}
          onMove={move}
          onStage={saveStage}
          onHistory={(order) => void openHistory(order)}
          onPayments={() => { setOpenKey(null); setView("payments"); setServedNote(""); }}
        />
      ) : null}

      {historyFor ? (
        <EarlierDialog order={historyFor} history={history} onClose={() => setHistoryFor(null)} />
      ) : null}
    </div>
  );
}

function TableDrawer({
  spot,
  now,
  busy,
  rejecting,
  reason,
  onClose,
  onReason,
  onReject,
  onMove,
  onStage,
  onHistory,
  onPayments,
}: {
  spot: Spot;
  now: number;
  busy: string;
  rejecting: string | null;
  reason: string;
  onClose: () => void;
  onReason: (value: string) => void;
  onReject: (id: string | null) => void;
  onMove: (publicId: string, status: string, note?: string) => Promise<void>;
  onStage: (publicId: string, minutes: number) => Promise<void>;
  onHistory: (order: Ticket) => void;
  onPayments: () => void;
}) {
  const rows = [...spot.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return (
    <div className="fixed inset-0 z-[80] flex justify-end bg-black/45" onClick={onClose}>
      <aside className="flex h-full w-full max-w-md flex-col bg-[#F6F1EA] shadow-2xl" onClick={(event) => event.stopPropagation()} role="dialog" aria-label={spot.title}>
        <div className="flex items-start justify-between gap-3 border-b border-[#E7DDD2] px-4 py-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#C4622D]">{spot.subtitle || "Open plates"}</p>
            <h3 className="mt-1 truncate text-xl font-semibold text-[#1C1410]">{spot.title}</h3>
            <p className="text-sm text-[#6B5A50]">{rows.length === 0 ? "Clear" : `${rows.length} open ${rows.length === 1 ? "plate" : "plates"}`}</p>
          </div>
          <button type="button" onClick={onClose} className="h-10 shrink-0 cursor-pointer rounded-full border-none bg-white px-4 text-sm font-semibold text-[#1C1410]">Close</button>
        </div>
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {rows.length === 0 ? (
            <div className="rounded-2xl bg-white px-4 py-8 text-center">
              <p className="text-sm text-[#6B5A50]">Nothing open here.</p>
              <button type="button" onClick={onPayments} className="mt-3 cursor-pointer border-none bg-transparent text-sm font-semibold text-[#C4622D]">Open payments</button>
            </div>
          ) : rows.map((order) => {
            const stage = ownerStage(order.status);
            const wait = waitLabel(order.stageDueAt, now);
            const working = busy.startsWith(order.publicId);
            return (
              <article key={order.publicId} className="rounded-2xl bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-[#1C1410]">{order.customerName}</p>
                    <p className="break-all font-mono text-[11px] text-[#6B5A50]">{order.customerPublicId}</p>
                    <p className="break-all font-mono text-[11px] text-[#C4622D]">{order.publicId}</p>
                  </div>
                  <p className="shrink-0 text-base font-bold text-[#1C1410]">{money(order.currency, order.total)}</p>
                </div>
                <ul className="mt-3 space-y-1 text-sm text-[#2A211C]">
                  {order.items.map((item, index) => (
                    <li key={`${order.publicId}-${index}`} className="flex justify-between gap-3">
                      <span className="min-w-0">{item.quantity} × {item.name}{item.variantLabel ? ` (${item.variantLabel})` : ""}</span>
                      <span className="shrink-0 text-[#6B5A50]">{money(order.currency, item.lineTotal)}</span>
                    </li>
                  ))}
                </ul>
                {stage ? (
                  <div className="mt-3">
                    <button type="button" disabled={working} onClick={() => void onMove(order.publicId, stage.next)} className="h-11 w-full cursor-pointer rounded-xl border-none bg-[#C4622D] text-sm font-semibold text-white disabled:opacity-50">
                      {working ? "Saving…" : stage.action}
                    </button>
                    <StageLine order={order} label={stage.title} waitText={wait ? `${wait.short} · by ${wait.clock}` : "Set this step"} onSave={(minutes) => onStage(order.publicId, minutes)} />
                    {order.status === "PLACED" ? (
                      <button type="button" onClick={() => onReject(order.publicId)} className="mt-2 cursor-pointer border-none bg-transparent p-0 text-xs font-semibold text-[#6B5A50]">Reject this plate</button>
                    ) : null}
                  </div>
                ) : null}
                {rejecting === order.publicId ? (
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                    <input value={reason} onChange={(event) => onReason(event.target.value)} placeholder="Short reason" className="h-10 min-w-0 flex-1 rounded-xl border border-[#E7DDD2] px-3 text-sm" />
                    <button type="button" onClick={() => void onMove(order.publicId, "REJECTED", reason)} className="h-10 cursor-pointer rounded-xl border-none bg-[#1C1410] px-3 text-sm font-semibold text-white">Send</button>
                  </div>
                ) : null}
                <button type="button" onClick={() => onHistory(order)} className="mt-3 cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-[#C4622D]">Earlier plates</button>
              </article>
            );
          })}
        </div>
      </aside>
    </div>
  );
}

function StageLine({ order, label, waitText, onSave }: { order: Ticket; label: string; waitText: string; onSave: (minutes: number) => Promise<void> }) {
  const [value, setValue] = useState("5");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!order.stageDueAt) return;
    const mins = Math.max(1, Math.ceil((new Date(order.stageDueAt).getTime() - Date.now()) / 60000));
    setValue(String(mins));
  }, [order.stageDueAt, order.publicId]);
  return (
    <div className="mt-2">
      <button type="button" onClick={() => setOpen((current) => !current)} className="flex w-full cursor-pointer items-center justify-between gap-2 border-none bg-transparent p-0 text-left text-xs text-[#6B5A50]">
        <span>{label}</span>
        <span className="font-semibold text-[#2A211C]">{waitText}</span>
      </button>
      {open ? (
        <div className="mt-2 flex items-center gap-2">
          <input inputMode="numeric" value={value} onChange={(event) => setValue(event.target.value.replace(/[^\d]/g, "").slice(0, 3))} aria-label={label} className="h-9 w-16 rounded-xl border border-[#E7DDD2] px-2 text-sm" />
          <span className="text-xs text-[#6B5A50]">min</span>
          <button
            type="button"
            disabled={saving || !value}
            onClick={() => {
              setSaving(true);
              void onSave(Math.round(Number(value))).finally(() => { setSaving(false); setOpen(false); });
            }}
            className="h-9 cursor-pointer rounded-xl border-none bg-[#1C1410] px-3 text-xs font-semibold text-white disabled:opacity-50"
          >
            {saving ? "Saving…" : "Set"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function EarlierDialog({ order, history, onClose }: { order: Ticket; history: Ticket[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/45 sm:items-center sm:p-6" onClick={onClose}>
      <div className="flex max-h-[88dvh] w-full max-w-lg flex-col rounded-t-3xl bg-[#F6F1EA] shadow-2xl sm:rounded-3xl" onClick={(event) => event.stopPropagation()} role="dialog" aria-label="Earlier plates">
        <div className="flex items-start justify-between gap-3 border-b border-[#E7DDD2] px-4 py-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#C4622D]">Earlier plates</p>
            <h3 className="mt-1 text-lg font-semibold text-[#1C1410]">{order.customerName}</h3>
            <p className="break-all font-mono text-xs text-[#6B5A50]">{order.customerPublicId}</p>
          </div>
          <button type="button" onClick={onClose} className="h-10 cursor-pointer rounded-full border-none bg-white px-4 text-sm font-semibold">Close</button>
        </div>
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {history.length === 0 ? <p className="rounded-2xl bg-white px-4 py-8 text-center text-sm text-[#6B5A50]">No earlier plates at this restaurant.</p> : history.map((past) => (
            <article key={past.publicId} className="rounded-2xl bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="break-all font-mono text-xs text-[#C4622D]">{past.publicId}</p>
                  <p className="mt-1 text-sm font-semibold text-[#1C1410]">{customerStatusCopy(past.status)}</p>
                  <p className="text-xs text-[#6B5A50]">{whenLabel(past.createdAt)} · {placeLabel(past.tableNumber)}</p>
                </div>
                <p className="shrink-0 font-bold text-[#1C1410]">{money(past.currency, past.total)}</p>
              </div>
              <ul className="mt-3 space-y-1 text-sm text-[#2A211C]">
                {past.items.map((item, index) => (
                  <li key={`${past.publicId}-${index}`} className="flex justify-between gap-3">
                    <span className="min-w-0">{item.quantity} × {item.name}</span>
                    <span className="shrink-0 text-[#6B5A50]">{money(past.currency, item.lineTotal)}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function OrderTimes({ order, servedAt, compact = true }: { order: Ticket; servedAt: string | null; compact?: boolean }) {
  return (
    <p className={`flex flex-wrap gap-x-3 gap-y-1 text-[#6B5A50] ${compact ? "mt-2 text-xs leading-5" : "text-sm"}`}>
      <span className="whitespace-nowrap">Received {whenLabel(order.createdAt)}</span>
      {servedAt ? <span className="whitespace-nowrap">Served {whenLabel(servedAt)}</span> : null}
      {order.paidAt ? <span className="whitespace-nowrap">Paid {whenLabel(order.paidAt)}</span> : null}
    </p>
  );
}

function PaymentsBoard({ tables, menus }: { tables: TableRow[]; menus: MenuRow[] }) {
  const pageSize = 12;
  const [draftQ, setDraftQ] = useState("");
  const [draftFrom, setDraftFrom] = useState("");
  const [draftTo, setDraftTo] = useState("");
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [place, setPlace] = useState("");
  const [page, setPage] = useState(1);
  const [pay, setPay] = useState<"unpaid" | "paid" | "rejected" | "all">("unpaid");
  const [rows, setRows] = useState<Ticket[]>([]);
  const [total, setTotal] = useState(0);
  const [unpaidTotal, setUnpaidTotal] = useState(0);
  const [counts, setCounts] = useState({ unpaid: 0, paid: 0, rejected: 0, all: 0 });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [detail, setDetail] = useState<Ticket | null>(null);
  const requestSeq = useRef(0);

  const load = useCallback(async (quiet = false) => {
    const id = ++requestSeq.current;
    if (!quiet) setLoading(true);
    const result = await restaurantService.listFinishedOrders({ q, from, to, status: pay, place, page, pageSize });
    if (id !== requestSeq.current) return;
    setLoading(false);
    if (!result.ok) return;
    setRows(result.data.orders || []);
    setTotal(Number(result.data.total || 0));
    setUnpaidTotal(Number(result.data.unpaidTotal || 0));
    setCounts(result.data.counts || { unpaid: 0, paid: 0, rejected: 0, all: 0 });
    if (result.data.page && result.data.page !== page) setPage(result.data.page);
  }, [from, page, pageSize, pay, place, q, to]);

  useEffect(() => {
    void load(false);
  }, [load]);

  useEffect(() => {
    const timer = window.setInterval(() => void load(true), 6000);
    return () => window.clearInterval(timer);
  }, [load]);

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(total, page * pageSize);

  const markPaid = async (order: Ticket, paid: boolean) => {
    setBusy(order.publicId);
    const result = await restaurantService.updateOrder(order.publicId, { paid });
    setBusy("");
    if (result.ok) await load(true);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl bg-[#1C1410] px-4 py-4 text-white">
          <p className="text-xs uppercase tracking-wide text-white/60">Unpaid</p>
          <p className="mt-1 text-2xl font-semibold">{counts.unpaid}</p>
          <p className="text-sm text-white/70">{money(rows[0]?.currency || "INR", unpaidTotal)} to collect</p>
        </div>
        <div className="rounded-2xl border border-[#E7DDD2] bg-white px-4 py-4">
          <p className="text-xs uppercase tracking-wide text-[#6B5A50]">Paid</p>
          <p className="mt-1 text-2xl font-semibold text-[#1C1410]">{counts.paid}</p>
          <p className="text-sm text-[#6B5A50]">Marked paid</p>
        </div>
        <div className="rounded-2xl border border-[#E7DDD2] bg-white px-4 py-4">
          <p className="text-xs uppercase tracking-wide text-[#6B5A50]">Rejected</p>
          <p className="mt-1 text-2xl font-semibold text-[#1C1410]">{counts.rejected}</p>
          <p className="text-sm text-[#6B5A50]">Not served</p>
        </div>
        <div className="rounded-2xl border border-[#E7DDD2] bg-white px-4 py-4">
          <p className="text-xs uppercase tracking-wide text-[#6B5A50]">All finished</p>
          <p className="mt-1 text-2xl font-semibold text-[#1C1410]">{counts.all}</p>
          <p className="text-sm text-[#6B5A50]">Every status</p>
        </div>
      </div>

      <form
        className="grid gap-2 rounded-2xl border border-[#E7DDD2] bg-white p-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(10rem,14rem)_auto_auto_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          setQ(draftQ);
          setFrom(draftFrom);
          setTo(draftTo);
          setPage(1);
        }}
      >
        <input value={draftQ} onChange={(event) => setDraftQ(event.target.value)} placeholder="Order id, customer, customer id, table" className="h-10 min-w-0 rounded-xl border border-[#E7DDD2] px-3 text-sm sm:col-span-2 lg:col-span-1" />
        <select value={place} aria-label="Table or menu" onChange={(event) => { setPlace(event.target.value); setPage(1); }} className="h-10 min-w-0 rounded-xl border border-[#E7DDD2] bg-white px-3 text-sm text-[#2A211C] sm:col-span-2 lg:col-span-1">
          <option value="">All tables and menus</option>
          <optgroup label="Tables">
            {tables.map((table) => (
              <option key={table.tableNumber} value={`table:${table.tableNumber}`}>{placeLabel(table.tableNumber)}</option>
            ))}
            <option value="counter">Counter</option>
          </optgroup>
          {menus.length ? (
            <optgroup label="Menus">
              {menus.map((menu) => (
                <option key={menu.id} value={`menu:${menu.id}`}>{menu.name}</option>
              ))}
            </optgroup>
          ) : null}
        </select>
        <input type="date" value={draftFrom} onChange={(event) => setDraftFrom(event.target.value)} aria-label="From date" className="h-10 rounded-xl border border-[#E7DDD2] px-3 text-sm" />
        <input type="date" value={draftTo} onChange={(event) => setDraftTo(event.target.value)} aria-label="To date" className="h-10 rounded-xl border border-[#E7DDD2] px-3 text-sm" />
        <button type="submit" className="h-10 cursor-pointer rounded-xl border-none bg-[#1C1410] px-4 text-sm font-semibold text-white">Search</button>
      </form>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {([
          ["unpaid", "Unpaid"],
          ["paid", "Paid"],
          ["rejected", "Rejected"],
          ["all", "All finished"],
        ] as const).map(([id, label]) => (
          <button key={id} type="button" onClick={() => { setPay(id); setPage(1); }} className={`inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-sm font-semibold ${pay === id ? "border-[#1C1410] bg-[#1C1410] text-white" : "border-[#E7DDD2] bg-white text-[#2A211C]"}`}>
            {label}
            <span className={pay === id ? "text-white/75" : "text-[#6B5A50]"}>{counts[id]}</span>
          </button>
        ))}
      </div>

      {loading ? <p className="text-sm text-[#6B5A50]">Loading payments…</p> : rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[#E7DDD2] bg-white px-4 py-10 text-center text-sm text-[#6B5A50]">Nothing in this list.</p>
      ) : (
        <div className="grid gap-3 lg:grid-cols-3">
          {rows.map((order) => {
            const servedAt = eventTime(order, "SERVED");
            return (
              <article key={order.publicId} className="rounded-2xl border border-[#E7DDD2] bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p className="text-lg font-semibold leading-tight text-[#1C1410]">{order.customerName}</p>
                      <span className="inline-flex rounded-full bg-[#F6F1EA] px-2.5 py-0.5 text-xs font-semibold text-[#2A211C]">{placeLabel(order.tableNumber)}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-start gap-2">
                    <div className="text-right">
                      <p className="text-lg font-bold leading-tight text-[#1C1410]">{money(order.currency, order.total)}</p>
                      <p className={`text-xs font-semibold ${order.status === "REJECTED" ? "text-[#6B5A50]" : order.paidAt ? "text-emerald-700" : "text-[#C4622D]"}`}>
                        {order.status === "REJECTED" ? "Rejected" : order.paidAt ? "Paid" : "Unpaid"}
                      </p>
                    </div>
                    <button type="button" onClick={() => setDetail(order)} aria-label={`View ${order.publicId}`} className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#E7DDD2] bg-white text-[#1C1410]">
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6B5A50]">Customer</p>
                    <p className="break-all font-mono text-xs text-[#2A211C]">{order.customerPublicId}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6B5A50]">Order</p>
                    <p className="break-all font-mono text-xs text-[#C4622D]">{order.publicId}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-[#2A211C]">{order.items.map((item) => `${item.quantity} × ${item.name}${item.variantLabel ? ` (${item.variantLabel})` : ""}`).join(", ")}</p>
                <OrderTimes order={order} servedAt={servedAt} />
                {order.status === "SERVED" ? (
                  <button type="button" disabled={busy === order.publicId} onClick={() => void markPaid(order, !order.paidAt)} className={`mt-3 h-10 w-full cursor-pointer rounded-xl border-none text-sm font-semibold disabled:opacity-50 ${order.paidAt ? "bg-[#F6F1EA] text-[#1C1410]" : "bg-[#1C1410] text-white"}`}>
                    {order.paidAt ? "Mark unpaid" : "Mark paid"}
                  </button>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
      {total > pageSize ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[#6B5A50]">{rangeStart}–{rangeEnd} of {total}</p>
          <div className="flex items-center gap-2">
            <button type="button" disabled={page <= 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))} className="h-9 cursor-pointer rounded-xl border border-[#E7DDD2] bg-white px-3 text-sm font-semibold text-[#1C1410] disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
            <span className="text-sm text-[#6B5A50]">{page} / {pageCount}</span>
            <button type="button" disabled={page >= pageCount || loading} onClick={() => setPage((current) => current + 1)} className="h-9 cursor-pointer rounded-xl border border-[#E7DDD2] bg-white px-3 text-sm font-semibold text-[#1C1410] disabled:cursor-not-allowed disabled:opacity-40">Next</button>
          </div>
        </div>
      ) : null}
      {detail ? <PaymentDetail order={detail} onClose={() => setDetail(null)} /> : null}
    </div>
  );
}

function PaymentDetail({ order, onClose }: { order: Ticket; onClose: () => void }) {
  const servedAt = eventTime(order, "SERVED");
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/45 sm:items-center sm:p-6" onClick={onClose}>
      <div className="flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl" onClick={(event) => event.stopPropagation()} role="dialog" aria-label="Order details">
        <div className="px-5 pt-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
              <h3 className="text-2xl font-semibold leading-tight text-[#1C1410]">{order.customerName}</h3>
              <span className="inline-flex rounded-full bg-[#F6F1EA] px-2.5 py-0.5 text-xs font-semibold text-[#2A211C]">{placeLabel(order.tableNumber)}</span>
            </div>
            <button type="button" onClick={onClose} className="h-9 shrink-0 cursor-pointer rounded-full border border-[#E7DDD2] bg-white px-3 text-sm font-semibold text-[#1C1410]">Close</button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-x-4">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6B5A50]">Order</p>
              <p className="break-all font-mono text-sm font-semibold text-[#C4622D]">{order.publicId}</p>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6B5A50]">Customer</p>
              <p className="break-all font-mono text-sm text-[#2A211C]">{order.customerPublicId}</p>
            </div>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-4">
          <div className="grid grid-cols-[minmax(0,1fr)_2.5rem_5.5rem_5.5rem] gap-x-3 border-b border-[#E7DDD2] pb-2 text-[11px] font-semibold uppercase tracking-wide text-[#6B5A50]">
            <span>Item</span>
            <span className="text-right">Qty</span>
            <span className="text-right">Price</span>
            <span className="text-right">Amount</span>
          </div>
          <ul>
            {order.items.map((item, index) => (
              <li key={`${order.publicId}-detail-${index}`} className="grid grid-cols-[minmax(0,1fr)_2.5rem_5.5rem_5.5rem] gap-x-3 border-b border-[#F0E7DE] py-2.5 text-sm">
                <span className="min-w-0 text-[#1C1410]">
                  <span className="font-medium">{item.name}</span>
                  {item.variantLabel ? <span className="mt-0.5 block text-xs text-[#6B5A50]">{item.variantLabel}</span> : null}
                </span>
                <span className="text-right text-[#2A211C]">{item.quantity}</span>
                <span className="text-right text-[#6B5A50]">{money(order.currency, item.unitPrice)}</span>
                <span className="text-right font-medium text-[#1C1410]">{money(order.currency, item.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <div className="ml-auto mt-3 w-full max-w-[16rem] space-y-1.5 text-sm text-[#6B5A50]">
            <div className="flex justify-between gap-4"><span>Subtotal</span><span>{money(order.currency, order.subtotal)}</span></div>
            <div className="flex justify-between gap-4"><span>{order.taxName || "Tax"}</span><span>{money(order.currency, order.tax)}</span></div>
            <div className="flex justify-between gap-4 border-t border-[#E7DDD2] pt-2 text-base font-bold text-[#1C1410]"><span>Total</span><span>{money(order.currency, order.total)}</span></div>
          </div>
          <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-[#E7DDD2] pt-3 text-xs sm:text-sm">
            <p className="whitespace-nowrap"><span className="text-[#6B5A50]">Received </span><span className="font-medium text-[#1C1410]">{whenLabel(order.createdAt)}</span></p>
            <p className="whitespace-nowrap"><span className="text-[#6B5A50]">Served </span><span className="font-medium text-[#1C1410]">{servedAt ? whenLabel(servedAt) : "Not served"}</span></p>
            {order.paidAt ? <p className="whitespace-nowrap"><span className="text-[#6B5A50]">Paid </span><span className="font-medium text-[#1C1410]">{whenLabel(order.paidAt)}</span></p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
