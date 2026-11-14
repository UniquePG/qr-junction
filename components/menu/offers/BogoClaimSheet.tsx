"use client";

import { useEffect, useMemo, useState } from "react";
import { Gift, X } from "lucide-react";
import type { BogoRules, GuestOfferDto } from "@/lib/offers/types";
import { getThemeOfferChrome } from "@/components/menu/themeChrome";
import { formatMoney } from "@/components/menu/shared";
import { usePlate } from "@/components/menu/ordering/PlateContext";
import { useOfferItemsById } from "./OfferContext";
import type { MenuItem } from "@/components/menu/types";

function variantFor(item: MenuItem) {
  return item.variants?.[0]?.label ?? null;
}

function itemPrice(item: MenuItem | undefined) {
  const value = Number(item?.price);
  return Number.isFinite(value) ? value : 0;
}

export function BogoClaimSheet({
  offer,
  currencySymbol,
  theme,
  onClose,
}: {
  offer: GuestOfferDto;
  currencySymbol: string;
  theme: string;
  onClose: () => void;
}) {
  const plate = usePlate();
  const itemsById = useOfferItemsById();
  const chrome = getThemeOfferChrome(theme);
  const rules = (offer.rules || {}) as BogoRules;
  const sameItem = rules.sameItem === true;
  const buyQty = Math.max(1, rules.buyQty || 1);
  const getQty = Math.max(1, rules.getQty || 1);

  const pool = useMemo(
    () => offer.itemIds.map((id) => itemsById.get(id)).filter(Boolean) as MenuItem[],
    [offer.itemIds, itemsById],
  );

  const [paidIds, setPaidIds] = useState<number[]>([]);
  const [freeIds, setFreeIds] = useState<number[]>([]);
  const [samePick, setSamePick] = useState<number | null>(pool[0]?.id ?? null);

  const paidMax = useMemo(() => {
    let max = 0;
    for (const id of paidIds) max = Math.max(max, itemPrice(itemsById.get(id)));
    return max;
  }, [paidIds, itemsById]);

  useEffect(() => {
    if (sameItem || paidMax <= 0) return;
    setFreeIds((prev) =>
      prev.filter((id) => itemPrice(itemsById.get(id)) <= paidMax + 0.009),
    );
  }, [sameItem, paidMax, itemsById]);

  const rewardLabel =
    rules.getMode === "free"
      ? "free"
      : rules.getMode === "percent"
        ? `${rules.getValue ?? 0}% off`
        : `${currencySymbol}${rules.getValue ?? 0} off`;

  const ready = sameItem
    ? samePick != null && pool.some((p) => p.id === samePick)
    : paidIds.length === buyQty && freeIds.length === getQty;

  function togglePick(list: number[], id: number, limit: number) {
    if (list.includes(id)) return list.filter((x) => x !== id);
    if (list.length >= limit) return [...list.slice(1), id];
    return [...list, id];
  }

  function claim() {
    if (!plate || !ready) return;
    if (sameItem && samePick != null) {
      const item = itemsById.get(samePick);
      if (!item) return;
      const total = buyQty + getQty;
      for (let i = 0; i < total; i += 1) plate.add(item, variantFor(item));
      onClose();
      return;
    }
    for (const id of paidIds) {
      const item = itemsById.get(id);
      if (item) plate.add(item, variantFor(item));
    }
    for (const id of freeIds) {
      const item = itemsById.get(id);
      if (item) plate.add(item, variantFor(item));
    }
    onClose();
  }

  return (
    <div
      className="fixed inset-x-0 top-0 z-[60] h-[100dvh] min-h-[100dvh]"
      role="dialog"
      aria-modal="true"
      aria-label="Claim BOGO deal"
    >
      <button type="button" className="absolute inset-0 bg-black/60" onClick={onClose} aria-label="Close" />
      <div
        className={`absolute inset-x-0 bottom-0 flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-3xl sm:inset-x-auto sm:left-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2 ${chrome.card}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`h-1 shrink-0 ${chrome.accent}`} aria-hidden />

        <div className="relative shrink-0 px-4 pb-2 pt-3">
          <button
            type="button"
            onClick={onClose}
            className={`absolute right-3 top-3 rounded-full p-1.5 ${chrome.panel}`}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="pr-8">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${chrome.badge}`}>
              <Gift className="h-2.5 w-2.5" aria-hidden />
              {offer.badgeLabel || "BOGO"}
            </span>
            <h3 className={`mt-1 text-base font-black leading-snug ${chrome.title}`}>{offer.title}</h3>
            <p className={`mt-0.5 text-[12px] ${chrome.muted}`}>
              Buy {buyQty}, get {getQty} {rewardLabel}
              {sameItem ? " · same dish" : " · mix from this list"}
            </p>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain px-4 py-1">
          {sameItem ? (
            <div className={`rounded-xl p-2 ${chrome.panel}`}>
              <p className={`mb-1.5 text-[10px] font-bold uppercase tracking-wide ${chrome.muted}`}>
                Pick a dish · we add {buyQty + getQty}
              </p>
              <div className="grid grid-cols-1 gap-1">
                {pool.map((item) => {
                  const on = samePick === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSamePick(item.id)}
                      className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 text-left transition ${
                        on ? chrome.badge : chrome.chip
                      }`}
                    >
                      <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md bg-black/5">
                        {item.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.image} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-[10px] font-black">
                            {item.name.slice(0, 1)}
                          </span>
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12px] font-bold">{item.name}</span>
                        <span className={`text-[10px] font-semibold ${on ? "opacity-80" : chrome.price}`}>
                          {formatMoney(currencySymbol, item.price)}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              <div className={`rounded-xl p-2 ${chrome.panel}`}>
                <p className={`mb-1.5 text-[10px] font-bold uppercase tracking-wide ${chrome.muted}`}>
                  1. You pay for ({paidIds.length}/{buyQty})
                </p>
                <div className="grid grid-cols-1 gap-1">
                  {pool.map((item) => {
                    const on = paidIds.includes(item.id);
                    const lockedAsFree = freeIds.includes(item.id);
                    return (
                      <button
                        key={`pay-${item.id}`}
                        type="button"
                        disabled={lockedAsFree}
                        onClick={() => setPaidIds((prev) => togglePick(prev, item.id, buyQty))}
                        className={`flex items-center justify-between rounded-lg border px-2.5 py-1.5 text-left text-[12px] font-semibold disabled:opacity-40 ${
                          on ? chrome.badge : chrome.chip
                        }`}
                      >
                        <span className="truncate">{item.name}</span>
                        <span className={on ? "opacity-80" : chrome.price}>
                          {formatMoney(currencySymbol, item.price)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className={`rounded-xl p-2 ${chrome.panel}`}>
                <p className={`mb-1 text-[10px] font-bold uppercase tracking-wide ${chrome.muted}`}>
                  2. You get {rewardLabel} ({freeIds.length}/{getQty})
                </p>
                <p className={`mb-1.5 text-[10px] leading-snug ${chrome.muted}`}>
                  Free item must be equal or lesser value than what you pay
                  {paidMax > 0 ? ` (≤ ${formatMoney(currencySymbol, paidMax)})` : ""}.
                </p>
                <div className="grid grid-cols-1 gap-1">
                  {pool.map((item) => {
                    const on = freeIds.includes(item.id);
                    const lockedAsPaid = paidIds.includes(item.id);
                    const tooExpensive =
                      rules.getMode === "free" &&
                      paidMax > 0 &&
                      itemPrice(item) > paidMax + 0.009;
                    const disabled = lockedAsPaid || tooExpensive;
                    return (
                      <button
                        key={`free-${item.id}`}
                        type="button"
                        disabled={disabled}
                        onClick={() => setFreeIds((prev) => togglePick(prev, item.id, getQty))}
                        className={`flex items-center justify-between rounded-lg border px-2.5 py-1.5 text-left text-[12px] font-semibold disabled:opacity-40 ${
                          on ? chrome.badge : chrome.chip
                        }`}
                      >
                        <span className="truncate">{item.name}</span>
                        <span className={on ? "opacity-80" : chrome.muted}>
                          {tooExpensive
                            ? "Too pricey"
                            : rules.getMode === "free"
                              ? "FREE"
                              : formatMoney(currencySymbol, item.price)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        <div
          className="flex shrink-0 gap-2 border-t border-black/10 px-4 pt-2.5"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <button type="button" onClick={onClose} className={`flex-1 rounded-full border px-3 py-2 text-[12px] font-semibold ${chrome.chip}`}>
            Cancel
          </button>
          <button
            type="button"
            disabled={!ready || !plate}
            onClick={claim}
            className={`flex-[1.4] rounded-full px-3 py-2 text-[12px] font-bold disabled:opacity-40 ${chrome.comboCta}`}
          >
            Add deal to plate
          </button>
        </div>
      </div>
    </div>
  );
}
