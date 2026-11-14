"use client";

import { useMemo } from "react";
import { ArrowRight, X } from "lucide-react";
import type {
  ComboRules,
  GuestOfferDto,
  ItemDiscountRules,
} from "@/lib/offers/types";
import type { MenuItem } from "@/components/menu/types";
import { getThemeOfferChrome } from "@/components/menu/themeChrome";
import { formatMoney } from "@/components/menu/shared";
import { useOfferItemsById } from "./OfferContext";

function discountedUnit(list: number, rules: ItemDiscountRules) {
  if (!Number.isFinite(list)) return null;
  if (rules.mode === "percent") {
    return Math.max(0, Math.round(list * (1 - rules.value / 100) * 100) / 100);
  }
  return Math.max(0, Math.round((list - rules.value) * 100) / 100);
}

export function OfferDishesSheet({
  offer,
  currencySymbol,
  theme,
  onClose,
  onSelectItem,
}: {
  offer: GuestOfferDto;
  currencySymbol: string;
  theme: string;
  onClose: () => void;
  onSelectItem?: (itemId: number) => void;
}) {
  const itemsById = useOfferItemsById();
  const chrome = getThemeOfferChrome(theme);
  const discountRules =
    offer.type === "ITEM_DISCOUNT" ? (offer.rules as ItemDiscountRules) : null;
  const comboRules = offer.type === "COMBO" ? (offer.rules as ComboRules) : null;

  const rows = useMemo(() => {
    if (comboRules?.slots?.length) {
      const out: { item: MenuItem; slotLabel?: string }[] = [];
      const seen = new Set<number>();
      comboRules.slots.forEach((slot) => {
        for (const id of slot.itemIds) {
          if (seen.has(id)) continue;
          const item = itemsById.get(id);
          if (!item) continue;
          seen.add(id);
          out.push({ item, slotLabel: slot.label });
        }
      });
      return out;
    }
    return offer.itemIds
      .map((id) => {
        const item = itemsById.get(id);
        return item ? { item } : null;
      })
      .filter(Boolean) as { item: MenuItem; slotLabel?: string }[];
  }, [comboRules, itemsById, offer.itemIds]);

  function pick(itemId: number) {
    onSelectItem?.(itemId);
    onClose();
  }

  return (
    <div
      className="fixed inset-x-0 top-0 z-[60] h-[100dvh] min-h-[100dvh]"
      role="dialog"
      aria-modal="true"
      aria-label="Offer dishes"
    >
      <button type="button" className="absolute inset-0 bg-black/60" onClick={onClose} aria-label="Close" />
      <div
        className={`absolute inset-x-0 bottom-0 flex max-h-[88dvh] w-full flex-col overflow-hidden rounded-t-3xl sm:inset-x-auto sm:left-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2 ${chrome.card}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`h-1 shrink-0 ${chrome.accent}`} aria-hidden />
        <div className="flex items-start justify-between gap-3 px-4 pb-2 pt-3">
          <div className="min-w-0 pr-2">
            <p className={`text-[10px] font-bold uppercase tracking-[0.14em] ${chrome.muted}`}>
              {offer.badgeLabel || offer.type.replace("_", " ")} · {rows.length}{" "}
              {rows.length === 1 ? "dish" : "dishes"}
            </p>
            <h3 className={`mt-0.5 text-base font-black leading-snug ${chrome.title}`}>{offer.title}</h3>
            {offer.subtitle ? (
              <p className={`mt-0.5 text-[12px] leading-snug ${chrome.muted}`}>{offer.subtitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`shrink-0 rounded-full p-1.5 ${chrome.panel}`}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {!rows.length ? (
            <p className={`py-8 text-center text-sm ${chrome.muted}`}>No dishes on this offer yet.</p>
          ) : (
            <ul className="space-y-1.5 pb-2">
              {rows.map(({ item, slotLabel }) => {
                const list = Number(item.price);
                const offerPrice = discountRules ? discountedUnit(list, discountRules) : null;
                const showStrike =
                  offerPrice != null && Number.isFinite(offerPrice) && offerPrice < list;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => pick(item.id)}
                      className={`flex w-full items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left transition active:scale-[0.99] ${chrome.chip}`}
                    >
                      <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-black/5">
                        {item.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.image} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className={`flex h-full w-full items-center justify-center text-[11px] font-black ${chrome.muted}`}>
                            {item.name.slice(0, 1).toUpperCase()}
                          </span>
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        {slotLabel ? (
                          <span className={`block text-[9px] font-bold uppercase tracking-wide ${chrome.muted}`}>
                            {slotLabel}
                          </span>
                        ) : null}
                        <span className="block truncate text-[13px] font-bold leading-snug">{item.name}</span>
                        <span className={`mt-0.5 flex items-center gap-1.5 text-[11px] font-semibold ${chrome.price}`}>
                          {showStrike ? (
                            <>
                              <span className={chrome.strike}>{formatMoney(currencySymbol, list)}</span>
                              <span>{formatMoney(currencySymbol, offerPrice)}</span>
                            </>
                          ) : (
                            <span>{formatMoney(currencySymbol, list)}</span>
                          )}
                        </span>
                      </span>
                      <ArrowRight className={`h-3.5 w-3.5 shrink-0 opacity-40 ${chrome.muted}`} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
