"use client";

import { useState, type ReactNode } from "react";
import { Check, Download, Minus, Pencil, Plus, ShoppingBag, X } from "lucide-react";
import { waitingLine } from "@/lib/orders/banter";
import { formatTableLabel, orderCallCode } from "@/lib/orders/displayId";
import { customerStatusCopy } from "@/lib/orders/status";
import { waitLabel } from "@/lib/orders/eta";
import type { LiveOrder, PlateLine } from "@/components/menu/ordering/PlateContext";
import { usePlate } from "@/components/menu/ordering/PlateContext";
import { useMenuLocaleOptional } from "@/components/menu/i18n/MenuLocaleProvider";

type QuoteLine = {
  menuItemId: number;
  name: string;
  variantLabel: string | null;
  unitPrice: number;
  listUnitPrice?: number;
  quantity: number;
  lineTotal: number;
  offerIds?: number[];
};

type Quote = {
  lines: QuoteLine[];
  subtotal: number;
  discount?: number;
  offersApplied?: Array<{ offerId: number; title: string; amount: number }>;
  tax: number;
  total: number;
  currency: string;
  taxName: string;
  taxRate: number;
};

const STEP_IDS = ["PLACED", "ACCEPTED", "PREPARING", "READY", "SERVED"] as const;

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

/** Sticky top strip — render above search so it never covers menu controls. */
export function PlateOrderStrip() {
  const plate = usePlate();
  const i18n = useMenuLocaleOptional();
  const t = i18n?.t;
  const statusCopy = (status: string, rejectReason?: string | null) =>
    i18n?.statusCopy(status, rejectReason) ?? customerStatusCopy(status, rejectReason);

  if (!plate?.enabled || plate.cartOpen || plate.trackerOpen) return null;

  const active = plate.liveOrders.filter((order) => !["SERVED", "REJECTED"].includes(order.status));
  const featured = active[0];
  const showPast = plate.liveOrders.length > 0 && !featured;
  if (!featured && !showPast) return null;

  const featuredWait = featured ? waitLabel(featured.expectedReadyAt, plate.now) : null;
  const featuredLine = featured
    ? waitingLine(featured.status, featured.publicId, dishName(featured), featured.rejectReason)
    : "";

  return (
    <div className="-mx-4 border-b border-[#EDE6DE]/80 px-4 pb-2.5">
      {featured ? (
        <button
          type="button"
          onClick={plate.openTracker}
          className="flex w-full cursor-pointer items-center gap-2.5 rounded-2xl border border-[#E7DDD2] bg-white/90 px-3 py-2 text-left shadow-sm"
        >
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C4622D] opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#C4622D]" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2">
              <span className="truncate text-[10px] font-bold uppercase tracking-[0.12em] text-[#C4622D]">
                {statusCopy(featured.status)}
              </span>
              {featuredWait ? (
                <span className="shrink-0 text-[11px] font-semibold text-[#1C1410]">{featuredWait.short}</span>
              ) : null}
            </span>
            <span className="mt-0.5 block truncate text-[12px] text-[#2A211C]">{featuredLine}</span>
          </span>
          <span className="shrink-0 text-[11px] font-semibold text-[#8A7366]">View</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={plate.openTracker}
          className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border border-[#E7DDD2] bg-white/90 px-3.5 py-2 text-left shadow-sm"
        >
          <span className="min-w-0">
            <span className="block text-[13px] font-semibold text-[#1C1410]">
              {t?.("yourOrders") || "Your orders"}
            </span>
            <span className="block truncate text-[11px] text-[#8A7366]">Earlier plates & payment</span>
          </span>
          <span className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-[#1C1410] px-1.5 text-[11px] font-bold text-white">
            {plate.liveOrders.length}
          </span>
        </button>
      )}
    </div>
  );
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
  note,
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
  onNote,
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
  note: string;
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
  onNote: (next: string) => void;
  onEditIdentity: () => void;
  onSaveIdentity: () => void;
  onCancelIdentity: () => void;
  onSend: () => void;
}) {
  const i18n = useMenuLocaleOptional();
  const t = i18n?.t;
  const [billBusyId, setBillBusyId] = useState<string | null>(null);
  const statusCopy = (status: string, rejectReason?: string | null) =>
    i18n?.statusCopy(status, rejectReason) ?? customerStatusCopy(status, rejectReason);

  async function downloadGuestBill(order: LiveOrder) {
    if (!order.publicToken || !order.paidAt || !order.digitalBillEnabled) return;
    setBillBusyId(order.publicId);
    try {
      const res = await fetch(
        `/api/public/orders/${encodeURIComponent(order.publicId)}/bill?token=${encodeURIComponent(order.publicToken)}`,
      );
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error || "Could not download bill");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `bill-${order.publicId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      // Quiet fail — guest UI stays calm
    } finally {
      setBillBusyId(null);
    }
  }
  const steps = STEP_IDS.map((id) => ({
    id,
    label:
      id === "PLACED"
        ? t?.("stepSent") || "Sent"
        : id === "ACCEPTED"
          ? t?.("stepAccepted") || "Accepted"
          : id === "PREPARING"
            ? t?.("stepCooking") || "Cooking"
            : id === "READY"
              ? t?.("stepOnTheWay") || "On the way"
              : t?.("stepAtTable") || "At the table",
  }));

  const active = liveOrders.filter((order) => !["SERVED", "REJECTED"].includes(order.status));
  const showCartDock = count > 0 && !cartOpen;
  const identityReady = customer.name.trim().length > 0 && phoneDigits(customer.phone).length >= 10;
  const showIdentityFields = !identityLocked && (!hasSavedIdentity || editingIdentity);
  function matchPlateLine(line: { menuItemId: number; variantLabel: string | null; unitPrice: number; quantity: number }) {
    return (
      lines.find(
        (row) =>
          row.item.id === line.menuItemId &&
          Math.abs(row.unitPrice - line.unitPrice) < 0.001 &&
          (row.variantLabel || "") === (line.variantLabel || ""),
      ) ||
      lines.find(
        (row) =>
          row.item.id === line.menuItemId &&
          Math.abs(row.unitPrice - line.unitPrice) < 0.001,
      ) ||
      lines.find((row) => row.item.id === line.menuItemId)
    );
  }

  // Local plate lines are source of truth so a stale quote never keeps removed dishes visible.
  const plateEmpty = lines.length === 0;
  const quoteMatchesPlate =
    !!quote &&
    quote.lines.length === lines.length &&
    lines.every((line) =>
      quote.lines.some(
        (row) =>
          row.menuItemId === line.item.id &&
          (row.variantLabel || "") === (line.variantLabel || "") &&
          row.quantity === line.quantity,
      ),
    );
  const displayLines: QuoteLine[] = plateEmpty
    ? []
    : lines.map((line) => {
        const quoted = quoteMatchesPlate
          ? quote?.lines.find(
              (row) =>
                row.menuItemId === line.item.id &&
                (row.variantLabel || "") === (line.variantLabel || ""),
            )
          : undefined;
        return {
          menuItemId: line.item.id,
          name: line.item.name,
          variantLabel: line.variantLabel,
          unitPrice: quoted?.unitPrice ?? line.unitPrice,
          listUnitPrice: quoted?.listUnitPrice ?? line.unitPrice,
          quantity: line.quantity,
          lineTotal: quoted?.lineTotal ?? line.unitPrice * line.quantity,
          offerIds: quoted?.offerIds,
        };
      });
  const localSubtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const subtotal = plateEmpty ? 0 : quoteMatchesPlate ? quote?.subtotal ?? localSubtotal : localSubtotal;
  const discount = plateEmpty || !quoteMatchesPlate ? 0 : quote?.discount ?? 0;
  const total = plateEmpty ? 0 : quoteMatchesPlate ? quote?.total ?? subtotal : localSubtotal;
  const offersApplied = plateEmpty || !quoteMatchesPlate ? [] : quote?.offersApplied || [];

  return (
    <>
      {showCartDock ? (
        <div
          className="pointer-events-none fixed inset-x-0 z-[60] flex justify-end px-4"
          style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
        >
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
        </div>
      ) : null}

      {cartOpen ? (
        <Drawer
          title={t?.("yourPlate") || "Your plate"}
          subtitle={formatTableLabel(tableNumber)}
          onClose={onCloseCart}
          busy={sending}
          footer={
            <div className="space-y-3">
              {quoteError ? <p className="text-sm text-red-600">{quoteError}</p> : null}
              <div className="flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#8A7366]">
                    {count} {count === 1 ? "item" : "items"}
                  </p>
                  <p className="mt-0.5 text-2xl font-bold tracking-tight text-[#1C1410]">
                    {money(currencySymbol, total)}
                  </p>
                  {discount > 0 ? (
                    <p className="mt-0.5 text-xs font-semibold text-emerald-700">
                      Saved {money(currencySymbol, discount)}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  disabled={sending || lines.length === 0 || !identityReady || (hasSavedIdentity && editingIdentity)}
                  onClick={onSend}
                  className="h-12 min-w-[9.5rem] flex-1 cursor-pointer rounded-full border-none bg-[#1C1410] px-5 text-sm font-semibold text-white transition enabled:hover:bg-[#2A211C] disabled:opacity-45"
                >
                  {sending ? "Sending…" : t?.("sendKitchen") || "Send to kitchen"}
                </button>
              </div>
            </div>
          }
        >
          {plateEmpty ? (
            <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F3EEE7] text-[#8A7366]">
                <ShoppingBag className="h-6 w-6" />
              </span>
              <p className="mt-4 text-base font-semibold text-[#1C1410]">
                {t?.("emptyPlate") || "Your plate is empty"}
              </p>
              <p className="mt-1 text-sm text-[#8A7366]">Add something from the menu to get started.</p>
            </div>
          ) : (
            <>
              <ul className="divide-y divide-[#EDE6DE]">
                {displayLines.map((line) => {
                  const source = matchPlateLine(line);
                  const listUnit = line.listUnitPrice ?? line.unitPrice;
                  const listLine = Math.round(listUnit * line.quantity * 100) / 100;
                  const saved = Math.max(0, Math.round((listLine - line.lineTotal) * 100) / 100);
                  const fullyFree = line.lineTotal === 0 && listLine > 0;
                  const freeUnits =
                    listUnit > 0 && saved > 0 ? Math.max(0, Math.round(saved / listUnit)) : 0;
                  const offerBadge = fullyFree
                    ? "Free"
                    : freeUnits > 0
                      ? freeUnits === 1
                        ? "1 free"
                        : `${freeUnits} free`
                      : saved > 0
                        ? "Offer"
                        : null;
                  const unitOnOffer = listUnit > line.unitPrice + 0.001;
                  return (
                    <li
                      key={`${line.menuItemId}:${line.variantLabel || ""}`}
                      className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[15px] font-semibold leading-snug text-[#1C1410]">{line.name}</p>
                          {offerBadge ? (
                            <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                              {offerBadge}
                            </span>
                          ) : null}
                        </div>
                        {line.variantLabel ? (
                          <p className="mt-0.5 text-xs text-[#8A7366]">{line.variantLabel}</p>
                        ) : null}
                        <p className="mt-1.5 text-[13px] leading-snug">
                          {unitOnOffer ? (
                            <>
                              <span className="mr-1.5 tabular-nums text-[#A08B7C] line-through">
                                {money(currencySymbol, listUnit)}
                              </span>
                              <span className="tabular-nums font-medium text-[#1C1410]">
                                {money(currencySymbol, line.unitPrice)}
                              </span>
                            </>
                          ) : (
                            <span className="tabular-nums font-medium text-[#1C1410]">
                              {money(currencySymbol, line.unitPrice)}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex w-[6.75rem] shrink-0 flex-col items-stretch gap-1.5">
                        {source ? (
                          <div className="flex h-9 w-full items-center justify-between rounded-full border border-[#E7DDD2] bg-white px-0.5">
                            <button
                              type="button"
                              onClick={() => onQuantity(source, source.quantity - 1)}
                              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-[#1C1410]"
                              aria-label="Remove one"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="min-w-4 text-center text-sm font-bold tabular-nums text-[#1C1410]">
                              {source.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onQuantity(source, source.quantity + 1)}
                              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-[#1C1410]"
                              aria-label="Add one"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : null}
                        <p className="text-right text-sm font-semibold tabular-nums leading-snug text-[#1C1410]">
                          {saved > 0 ? (
                            <span className="mr-1 block text-[11px] font-medium text-[#A08B7C] line-through">
                              {money(currencySymbol, listLine)}
                            </span>
                          ) : null}
                          <span>{fullyFree ? "FREE" : money(currencySymbol, line.lineTotal)}</span>
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <section className="mt-5">
                <div className="overflow-hidden rounded-2xl border border-[#EDE6DE] bg-[#FAF7F3]">
                  <div className="flex items-center justify-between gap-3 border-b border-[#EDE6DE] px-4 py-2.5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A7366]">
                      Price breakdown
                    </p>
                    {discount > 0 ? (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                        Saved {money(currencySymbol, discount)}
                      </span>
                    ) : null}
                  </div>

                  <div className="space-y-2.5 px-4 py-3.5 text-sm">
                    <div className="flex items-center justify-between gap-3 text-[#6B5A50]">
                      <span>Item total</span>
                      <span className="tabular-nums font-medium text-[#1C1410]">
                        {money(currencySymbol, subtotal + discount)}
                      </span>
                    </div>

                    {offersApplied.length
                      ? offersApplied.map((o) => (
                          <div
                            key={o.offerId}
                            className="flex items-start justify-between gap-3 text-emerald-700"
                          >
                            <span className="min-w-0 leading-snug">
                              <span className="block text-[11px] font-semibold uppercase tracking-wide text-emerald-600/80">
                                Offer
                              </span>
                              <span className="block truncate text-[13px]">{o.title}</span>
                            </span>
                            <span className="shrink-0 tabular-nums font-medium">
                              −{money(currencySymbol, o.amount)}
                            </span>
                          </div>
                        ))
                      : discount > 0 ? (
                          <div className="flex items-center justify-between gap-3 text-emerald-700">
                            <span>Discount</span>
                            <span className="tabular-nums font-medium">
                              −{money(currencySymbol, discount)}
                            </span>
                          </div>
                        ) : null}

                    <div className="flex items-center justify-between gap-3 text-[#6B5A50]">
                      <span>
                        {quote?.taxName || "Tax"}
                        {quote ? ` · ${quote.taxRate}%` : ""}
                      </span>
                      <span className="tabular-nums font-medium text-[#1C1410]">
                        {money(currencySymbol, quote?.tax ?? 0)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t border-[#EDE6DE] bg-white px-4 py-3.5">
                    <span className="text-[15px] font-bold text-[#1C1410]">To pay</span>
                    <span className="text-lg font-bold tabular-nums tracking-tight text-[#1C1410]">
                      {money(currencySymbol, total)}
                    </span>
                  </div>
                </div>
              </section>

              <section className="mt-5 border-t border-[#EDE6DE] pt-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A7366]">
                    Your details
                  </p>
                  {hasSavedIdentity && !showIdentityFields && !identityLocked ? (
                    <button
                      type="button"
                      onClick={onEditIdentity}
                      className="inline-flex cursor-pointer items-center gap-1 border-none bg-transparent text-xs font-semibold text-[#C4622D]"
                      aria-label="Edit name and mobile"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                  ) : null}
                </div>

                {!showIdentityFields ? (
                  <div className="mt-3">
                    <p className="text-[15px] font-semibold text-[#1C1410]">{customer.name}</p>
                    <p className="mt-0.5 text-sm text-[#6B5A50]">{prettyPhone(customer.phone)}</p>
                    <p className="mt-2 text-xs leading-relaxed text-[#8A7366]">
                      {identityLocked
                        ? "Locked while a plate is with the kitchen."
                        : "Saved on this phone — we won’t ask again."}
                    </p>
                  </div>
                ) : (
                  <div className="mt-3 space-y-3">
                    <label className="block text-xs font-medium text-[#6B5A50]">
                      Name
                      <input
                        value={customer.name}
                        onChange={(event) => onCustomer({ ...customer, name: event.target.value })}
                        className="mt-1.5 w-full rounded-xl border border-[#E7DDD2] bg-[#FAF7F3] px-3.5 py-2.5 text-sm text-[#1C1410] outline-none transition focus:border-[#C4622D]/50 focus:ring-2 focus:ring-[#C4622D]/15"
                      />
                    </label>
                    <label className="block text-xs font-medium text-[#6B5A50]">
                      Mobile number
                      <input
                        inputMode="tel"
                        value={customer.phone}
                        onChange={(event) => onCustomer({ ...customer, phone: event.target.value })}
                        className="mt-1.5 w-full rounded-xl border border-[#E7DDD2] bg-[#FAF7F3] px-3.5 py-2.5 text-sm text-[#1C1410] outline-none transition focus:border-[#C4622D]/50 focus:ring-2 focus:ring-[#C4622D]/15"
                      />
                    </label>
                    {hasSavedIdentity ? (
                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={onCancelIdentity}
                          className="h-10 flex-1 cursor-pointer rounded-full border border-[#E7DDD2] bg-white text-sm font-semibold text-[#1C1410]"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={onSaveIdentity}
                          className="inline-flex h-10 flex-1 cursor-pointer items-center justify-center gap-1 rounded-full border-none bg-[#1C1410] text-sm font-semibold text-white"
                        >
                          <Check className="h-4 w-4" />
                          Save
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs leading-relaxed text-[#8A7366]">
                        Once — then the kitchen knows who this plate is for.
                      </p>
                    )}
                  </div>
                )}

                <label className="mt-5 block text-xs font-medium text-[#6B5A50]">
                  Note for the kitchen
                  <textarea
                    value={note}
                    onChange={(event) => onNote(event.target.value.slice(0, 160))}
                    rows={2}
                    maxLength={160}
                    placeholder={t?.("notePlaceholder") || "Less spice, no onion, pack separately…"}
                    className="mt-1.5 w-full resize-none rounded-xl border border-[#E7DDD2] bg-[#FAF7F3] px-3.5 py-2.5 text-sm font-normal normal-case tracking-normal text-[#1C1410] outline-none transition placeholder:text-[#A08B7C] focus:border-[#C4622D]/50 focus:ring-2 focus:ring-[#C4622D]/15"
                  />
                </label>
                <p className="mt-1 text-right text-[11px] text-[#A08B7C]">{note.trim().length}/160</p>
              </section>
            </>
          )}
        </Drawer>
      ) : null}

      {trackerOpen ? (
        <Drawer title={t?.("yourOrders") || "Your orders"} subtitle={active.length ? `${active.length} with the kitchen` : "Earlier plates from this visit"} onClose={onCloseTracker}>
          <div className="space-y-4">
            {liveOrders.map((order) => {
              const wait = waitLabel(order.expectedReadyAt, now);
              const terminal = order.status === "SERVED" || order.status === "REJECTED";
              const servedAt = eventTime(order, "SERVED");
              const payment = order.status === "SERVED" ? (order.paidAt ? "Paid" : "Unpaid") : null;
              const stepIndex = steps.findIndex((step) => step.id === order.status);
              const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
              return (
                <article
                  key={order.publicId}
                  className="overflow-hidden rounded-2xl border border-[#EDE6DE] bg-white"
                >
                  <div className="space-y-3 px-3.5 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <p className="font-mono text-[11px] font-semibold tracking-wide text-[#C4622D]">
                            {orderCallCode(order.publicId, order.tableNumber)}
                          </p>
                          <span className="text-[11px] text-[#A08B7C]">·</span>
                          <p className="text-[11px] text-[#8A7366]">
                            {whenLabel(order.createdAt)}
                            {servedAt ? ` · Served ${whenLabel(servedAt)}` : ""}
                            {order.paidAt ? ` · Paid ${whenLabel(order.paidAt)}` : ""}
                          </p>
                        </div>
                        <p className="mt-1 text-[14px] font-bold leading-snug text-[#1C1410]">
                          {statusCopy(order.status, order.rejectReason)}
                        </p>
                      </div>
                      {payment ? (
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            order.paidAt ? "bg-emerald-50 text-emerald-700" : "bg-[#F6F1EA] text-[#C4622D]"
                          }`}
                        >
                          {payment}
                        </span>
                      ) : !terminal && wait ? (
                        <div className="shrink-0 text-right">
                          <p className="text-[13px] font-bold text-[#1C1410]">{wait.short}</p>
                          <p className="text-[10px] text-[#8A7366]">{wait.clock}</p>
                        </div>
                      ) : null}
                    </div>

                    {order.status === "REJECTED" ? (
                      <p className="text-[12px] leading-snug text-[#6B5A50]">
                        {waitingLine(order.status, order.publicId, dishName(order), order.rejectReason)}
                      </p>
                    ) : (
                      <ol className="flex items-center gap-1">
                        {steps.map((step, index) => {
                          const done = stepIndex >= index && stepIndex >= 0;
                          const current = step.id === order.status;
                          return (
                            <li key={step.id} className="min-w-0 flex-1">
                              <div className={`h-0.5 rounded-full ${done ? "bg-[#C4622D]" : "bg-[#E7DDD2]"}`} />
                              <p
                                className={`mt-1 truncate text-[9px] font-semibold ${
                                  current ? "text-[#C4622D]" : "text-[#A08B7C]"
                                }`}
                              >
                                {step.label}
                              </p>
                            </li>
                          );
                        })}
                      </ol>
                    )}
                  </div>

                  <div className="border-t border-[#EDE6DE] px-3.5 py-2.5">
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8A7366]">
                        {itemCount} {itemCount === 1 ? "item" : "items"}
                      </p>
                    </div>
                    <ul className="space-y-0">
                      {order.items.map((item, index) => (
                        <li
                          key={`${order.publicId}-${index}`}
                          className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-2.5 gap-y-0.5 py-1.5"
                        >
                          <span className="pt-px text-[12px] font-bold tabular-nums text-[#8A7366]">
                            {item.quantity}×
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-medium leading-snug text-[#1C1410]">
                              {item.name}
                            </p>
                            <p className="mt-0.5 truncate text-[11px] tabular-nums text-[#8A7366]">
                              {item.variantLabel ? `${item.variantLabel} · ` : null}
                              {money(currencySymbol, item.unitPrice)} each
                            </p>
                          </div>
                          <p className="shrink-0 pt-px text-right text-[13px] font-semibold tabular-nums text-[#1C1410]">
                            {money(currencySymbol, item.lineTotal)}
                          </p>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-2 space-y-1 border-t border-dashed border-[#EDE6DE] pt-2 text-[12px] text-[#6B5A50]">
                      <div className="flex justify-between gap-3">
                        <span>Subtotal</span>
                        <span className="tabular-nums">{money(currencySymbol, order.subtotal)}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span>{order.taxName || "Tax"}</span>
                        <span className="tabular-nums">{money(currencySymbol, order.tax)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 pt-0.5">
                        <span className="text-[13px] font-bold text-[#1C1410]">Total</span>
                        <span className="text-[14px] font-bold tabular-nums text-[#1C1410]">
                          {money(currencySymbol, order.total)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {order.paidAt && order.digitalBillEnabled ? (
                    <div className="border-t border-[#EDE6DE] px-3.5 py-2.5">
                      <button
                        type="button"
                        disabled={billBusyId === order.publicId}
                        onClick={() => void downloadGuestBill(order)}
                        className="inline-flex h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-full border-none bg-[#1C1410] text-[13px] font-semibold text-white disabled:opacity-50"
                      >
                        <Download className="h-3.5 w-3.5" />
                        {billBusyId === order.publicId ? "Preparing…" : "Download bill"}
                      </button>
                    </div>
                  ) : null}
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
    <div className="fixed inset-0 z-[80] flex justify-end bg-black/50 backdrop-blur-[2px]" onClick={() => !busy && onClose()}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex h-full w-full max-w-md flex-col bg-[#FFFCFA] shadow-[0_0_60px_rgba(28,20,16,0.28)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-5">
          <div className="min-w-0 pr-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A7366]">{subtitle}</p>
            <h2 className="mt-1 text-[1.35rem] font-bold tracking-tight text-[#1C1410]">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#E7DDD2] bg-white text-[#1C1410] transition hover:bg-[#F6F1EA] disabled:opacity-40"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-1">{children}</div>
        {footer ? (
          <div
            className="border-t border-[#EDE6DE] bg-white/95 px-5 pt-4 backdrop-blur"
            style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
          >
            {footer}
          </div>
        ) : null}
      </aside>
    </div>
  );
}
