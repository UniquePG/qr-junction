"use client";

import type { ReactNode } from "react";
import { Check, Pencil, ShoppingBag, X } from "lucide-react";
import { waitingLine } from "@/lib/orders/banter";
import { customerStatusCopy } from "@/lib/orders/status";
import { waitLabel } from "@/lib/orders/eta";
import type { LiveOrder, PlateLine } from "@/components/menu/ordering/PlateContext";

type QuoteLine = {
  menuItemId: number;
  name: string;
  variantLabel: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

type Quote = {
  lines: QuoteLine[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  taxName: string;
  taxRate: number;
};

const STEPS = [
  { id: "PLACED", label: "Sent" },
  { id: "ACCEPTED", label: "Accepted" },
  { id: "PREPARING", label: "Cooking" },
  { id: "READY", label: "On the way" },
  { id: "SERVED", label: "At the table" },
];

function money(symbol: string, value: number) {
  return `${symbol}${Number(value).toFixed(2)}`;
}

function phoneDigits(value: string) {
  return value.replace(/\D/g, "");
}

function prettyPhone(value: string) {
  const digits = phoneDigits(value);
  if (digits.length === 10) return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  return value.trim();
}

function dishName(order: LiveOrder) {
  const first = order.items[0];
  if (!first) return "Your plate";
  return order.items.length > 1 ? `${first.name} and more` : first.name;
}

function whenLabel(iso: string | null | undefined) {
  if (!iso) return "";
  return new Date(iso).toLocaleString([], { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

function eventTime(order: LiveOrder, status: string) {
  return order.events?.find((event) => event.status === status)?.createdAt || null;
}

export function PlateChrome({
  count,
  lines,
  quote,
  quoteError,
  sending,
  currencySymbol,
  tableNumber,
  customer,
  hasSavedIdentity,
  editingIdentity,
  identityLocked,
  cartOpen,
  trackerOpen,
  liveOrders,
  now,
  onOpenCart,
  onCloseCart,
  onOpenTracker,
  onCloseTracker,
  onQuantity,
  onCustomer,
  onEditIdentity,
  onSaveIdentity,
  onCancelIdentity,
  onSend,
}: {
  count: number;
  lines: PlateLine[];
  quote: Quote | null;
  quoteError: string;
  sending: boolean;
  currencySymbol: string;
  tableNumber: string | null;
  customer: { name: string; phone: string };
  hasSavedIdentity: boolean;
  editingIdentity: boolean;
  identityLocked: boolean;
  cartOpen: boolean;
  trackerOpen: boolean;
  liveOrders: LiveOrder[];
  now: number;
  onOpenCart: () => void;
  onCloseCart: () => void;
  onOpenTracker: () => void;
  onCloseTracker: () => void;
  onQuantity: (line: PlateLine, quantity: number) => void;
  onCustomer: (next: { name: string; phone: string }) => void;
  onEditIdentity: () => void;
  onSaveIdentity: () => void;
  onCancelIdentity: () => void;
  onSend: () => void;
}) {
  const active = liveOrders.filter((order) => !["SERVED", "REJECTED"].includes(order.status));
  const featured = active[0];
  const featuredWait = featured ? waitLabel(featured.expectedReadyAt, now) : null;
  const featuredLine = featured ? waitingLine(featured.status, featured.publicId, dishName(featured), featured.rejectReason) : "";
  const showOrders = liveOrders.length > 0 && !featured && !trackerOpen && !cartOpen;
  const showDock = (count > 0 && !cartOpen) || (Boolean(featured) && !trackerOpen && !cartOpen) || showOrders;
  const identityReady = customer.name.trim().length > 0 && phoneDigits(customer.phone).length >= 10;
  const showIdentityFields = !identityLocked && (!hasSavedIdentity || editingIdentity);
  const displayLines: QuoteLine[] = quote?.lines || lines.map((line) => ({
    menuItemId: line.item.id,
    name: line.item.name,
    variantLabel: line.variantLabel,
    unitPrice: line.unitPrice,
    quantity: line.quantity,
    lineTotal: line.unitPrice * line.quantity,
  }));
  const subtotal = quote?.subtotal ?? lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const total = quote?.total ?? subtotal;

  return (
    <>
      {showDock ? (
        <div
          className="pointer-events-none fixed inset-x-0 z-[60] flex justify-end px-4"
          style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
        >
          <div className="pointer-events-none flex w-full max-w-md items-end justify-end gap-3">
          {showOrders ? (
            <button
              type="button"
              onClick={onOpenTracker}
              className="pointer-events-auto flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-3 rounded-2xl border border-[#E7DDD2] bg-white/95 px-4 py-3 text-left shadow-[0_12px_40px_rgba(28,20,16,0.18)] backdrop-blur"
            >
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-[#1C1410]">Your orders</span>
                <span className="block truncate text-xs text-[#6B5A50]">Earlier plates, times, and payment</span>
              </span>
              <span className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-[#1C1410] px-1.5 text-[11px] font-bold text-white">{liveOrders.length}</span>
            </button>
          ) : null}
          {featured && !trackerOpen && !cartOpen ? (
            <button
              type="button"
              onClick={onOpenTracker}
              className="pointer-events-auto flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-2xl border border-[#E7DDD2] bg-white/95 px-3 py-2.5 text-left shadow-[0_12px_40px_rgba(28,20,16,0.18)] backdrop-blur"
            >
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C4622D] opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#C4622D]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-[#C4622D]">
                    {customerStatusCopy(featured.status)}
                  </span>
                  {featuredWait ? <span className="shrink-0 text-[11px] font-semibold text-[#1C1410]">{featuredWait.short}</span> : null}
                </span>
                <span className="mt-0.5 block truncate text-sm text-[#1C1410]">{featuredLine}</span>
              </span>
            </button>
          ) : null}
          {count > 0 && !cartOpen ? (
            <button
              type="button"
              onClick={onOpenCart}
              aria-label={`Your plate, ${count} ${count === 1 ? "item" : "items"}`}
              className="pointer-events-auto relative flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-[#1C1410] text-white shadow-[0_12px_30px_rgba(28,20,16,0.35)]"
            >
              <ShoppingBag className="h-6 w-6" />
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#C4622D] px-1 text-[11px] font-bold text-white">
                {count}
              </span>
            </button>
          ) : null}
          </div>
        </div>
      ) : null}

      {cartOpen ? (
        <Drawer
          title="Your plate"
          subtitle={tableNumber ? `Table ${tableNumber}` : "Counter"}
          onClose={onCloseCart}
          busy={sending}
          footer={
            <div>
              {quoteError ? <p className="mb-3 text-sm text-red-600">{quoteError}</p> : null}
              <button
                type="button"
                disabled={sending || lines.length === 0 || !identityReady || (hasSavedIdentity && editingIdentity)}
                onClick={onSend}
                className="h-12 w-full cursor-pointer rounded-2xl border-none bg-[#C4622D] text-sm font-semibold text-white disabled:opacity-50"
              >
                {sending ? "Sending…" : "Send to the kitchen"}
              </button>
            </div>
          }
        >
          <div className="space-y-3">
            {displayLines.map((line) => {
              const source = lines.find((row) => row.item.id === line.menuItemId && (row.variantLabel || "") === (line.variantLabel || ""));
              return (
                <div key={`${line.menuItemId}:${line.variantLabel || ""}`} className="flex items-center gap-3 rounded-2xl bg-white p-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[#1C1410]">{line.name}</p>
                    {line.variantLabel ? <p className="text-xs text-[#6B5A50]">{line.variantLabel}</p> : null}
                    <p className="mt-1 text-sm font-semibold text-[#1C1410]">{money(currencySymbol, line.lineTotal)}</p>
                  </div>
                  {source ? (
                    <div className="flex items-center rounded-full bg-[#F6F1EA] p-1">
                      <button type="button" onClick={() => onQuantity(source, source.quantity - 1)} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-none bg-white text-lg text-[#1C1410]" aria-label="Remove one">−</button>
                      <span className="w-7 text-center text-sm font-semibold">{source.quantity}</span>
                      <button type="button" onClick={() => onQuantity(source, source.quantity + 1)} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-none bg-white text-lg text-[#1C1410]" aria-label="Add one">+</button>
                    </div>
                  ) : null}
                </div>
              );
            })}
            {lines.length === 0 ? <p className="rounded-2xl bg-white px-4 py-8 text-center text-sm text-[#6B5A50]">Your plate is empty.</p> : null}
          </div>

          <div className="mt-4 space-y-1 rounded-2xl bg-white px-4 py-3 text-sm text-[#6B5A50]">
            <div className="flex justify-between"><span>Subtotal</span><span>{money(currencySymbol, subtotal)}</span></div>
            <div className="flex justify-between"><span>{quote?.taxName || "Tax"}{quote ? ` ${quote.taxRate}%` : ""}</span><span>{money(currencySymbol, quote?.tax ?? 0)}</span></div>
            <div className="flex justify-between text-base font-bold text-[#1C1410]"><span>Total</span><span>{money(currencySymbol, total)}</span></div>
          </div>

          <div className="mt-4 rounded-2xl bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6B5A50]">For the kitchen</p>
              {hasSavedIdentity && !showIdentityFields && !identityLocked ? (
                <button type="button" onClick={onEditIdentity} className="inline-flex cursor-pointer items-center gap-1 border-none bg-transparent text-xs font-semibold text-[#C4622D]" aria-label="Edit name and mobile">
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
              ) : null}
            </div>
            {!showIdentityFields ? (
              <div className="mt-2">
                <p className="text-base font-semibold text-[#1C1410]">{customer.name}</p>
                <p className="text-sm text-[#6B5A50]">{prettyPhone(customer.phone)}</p>
                <p className="mt-2 text-xs text-[#6B5A50]">
                  {identityLocked ? "This stays as it is while a plate is with the kitchen." : "Saved on this phone. We will not ask again."}
                </p>
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                <label className="block text-xs font-semibold text-[#6B5A50]">Name
                  <input value={customer.name} onChange={(event) => onCustomer({ ...customer, name: event.target.value })} className="mt-1 w-full rounded-xl border border-[#E7DDD2] bg-[#F6F1EA] px-3 py-2 text-sm text-[#1C1410] outline-none" />
                </label>
                <label className="block text-xs font-semibold text-[#6B5A50]">Mobile number
                  <input inputMode="tel" value={customer.phone} onChange={(event) => onCustomer({ ...customer, phone: event.target.value })} className="mt-1 w-full rounded-xl border border-[#E7DDD2] bg-[#F6F1EA] px-3 py-2 text-sm text-[#1C1410] outline-none" />
                </label>
                {hasSavedIdentity ? (
                  <div className="flex gap-2">
                    <button type="button" onClick={onCancelIdentity} className="h-9 flex-1 cursor-pointer rounded-xl border-none bg-[#F6F1EA] text-sm font-semibold text-[#1C1410]">Cancel</button>
                    <button type="button" onClick={onSaveIdentity} className="inline-flex h-9 flex-1 cursor-pointer items-center justify-center gap-1 rounded-xl border-none bg-[#1C1410] text-sm font-semibold text-white">
                      <Check className="h-4 w-4" />
                      Save
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-[#6B5A50]">Once. After this, the kitchen already knows who the plate is for.</p>
                )}
              </div>
            )}
          </div>

        </Drawer>
      ) : null}

      {trackerOpen ? (
        <Drawer title="Your orders" subtitle={active.length ? `${active.length} with the kitchen` : "Earlier plates from this visit"} onClose={onCloseTracker}>
          <div className="space-y-4">
            {liveOrders.map((order) => {
              const wait = waitLabel(order.expectedReadyAt, now);
              const terminal = order.status === "SERVED" || order.status === "REJECTED";
              const servedAt = eventTime(order, "SERVED");
              const payment = order.status === "SERVED" ? (order.paidAt ? "Paid" : "Unpaid") : null;
              const stepIndex = STEPS.findIndex((step) => step.id === order.status);
              return (
                <article key={order.publicId} className="rounded-3xl bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-[11px] font-semibold text-[#C4622D]">{order.publicId}</p>
                      <p className="mt-1 text-base font-semibold text-[#1C1410]">{customerStatusCopy(order.status, order.rejectReason)}</p>
                    </div>
                    {payment ? (
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${order.paidAt ? "bg-emerald-50 text-emerald-700" : "bg-[#F6F1EA] text-[#C4622D]"}`}>{payment}</span>
                    ) : !terminal && wait ? (
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-bold text-[#1C1410]">{wait.short}</p>
                        <p className="text-[11px] text-[#6B5A50]">around {wait.clock}</p>
                      </div>
                    ) : null}
                  </div>
                  <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#6B5A50]">
                    <span className="whitespace-nowrap">Ordered {whenLabel(order.createdAt)}</span>
                    {servedAt ? <span className="whitespace-nowrap">Served {whenLabel(servedAt)}</span> : null}
                    {order.paidAt ? <span className="whitespace-nowrap">Paid {whenLabel(order.paidAt)}</span> : null}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-[#2A211C]">{waitingLine(order.status, order.publicId, dishName(order), order.rejectReason)}</p>
                  {order.status === "REJECTED" ? null : (
                    <ol className="mt-4 flex items-center gap-1">
                      {STEPS.map((step, index) => {
                        const done = stepIndex >= index && stepIndex >= 0;
                        const current = step.id === order.status;
                        return (
                          <li key={step.id} className="min-w-0 flex-1">
                            <div className={`h-1 rounded-full ${done ? "bg-[#C4622D]" : "bg-[#E7DDD2]"}`} />
                            <p className={`mt-1 truncate text-[10px] font-semibold ${current ? "text-[#C4622D]" : "text-[#6B5A50]"}`}>{step.label}</p>
                          </li>
                        );
                      })}
                    </ol>
                  )}
                  <ul className="mt-4 space-y-1 text-sm text-[#2A211C]">
                    {order.items.map((item, index) => (
                      <li key={`${order.publicId}-${index}`} className="flex justify-between gap-3">
                        <span className="min-w-0">{item.quantity} × {item.name}{item.variantLabel ? ` · ${item.variantLabel}` : ""}</span>
                        <span className="shrink-0">{money(currencySymbol, item.lineTotal)}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-right text-sm font-bold text-[#1C1410]">{money(currencySymbol, order.total)}</p>
                </article>
              );
            })}
          </div>
        </Drawer>
      ) : null}
    </>
  );
}

function Drawer({
  title,
  subtitle,
  onClose,
  busy,
  footer,
  children,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  busy?: boolean;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex justify-end bg-black/45" onClick={() => !busy && onClose()}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex h-full w-full max-w-md flex-col bg-[#F6F1EA] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-[#E7DDD2] px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#C4622D]">{subtitle}</p>
            <h2 className="mt-1 text-xl font-bold text-[#1C1410]">{title}</h2>
          </div>
          <button type="button" onClick={onClose} disabled={busy} aria-label="Close" className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-none bg-white text-[#1C1410] disabled:opacity-40">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer ? <div className="border-t border-[#E7DDD2] bg-[#F6F1EA] px-5 py-4">{footer}</div> : null}
      </aside>
    </div>
  );
}
