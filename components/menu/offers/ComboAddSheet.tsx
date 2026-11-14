"use client";

import { useMemo, useState } from "react";
import { Layers, X } from "lucide-react";
import type { ComboRules, GuestOfferDto } from "@/lib/offers/types";
import { getThemeOfferChrome } from "@/components/menu/themeChrome";
import { formatMoney } from "@/components/menu/shared";
import { usePlate } from "@/components/menu/ordering/PlateContext";
import { useOfferItemsById } from "./OfferContext";

export function ComboAddSheet({
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
  const rules = offer.rules as ComboRules;
  const slots = Array.isArray(rules?.slots) ? rules.slots : [];
  const [picks, setPicks] = useState<Record<number, number>>({});

  const listSum = useMemo(() => {
    let sum = 0;
    for (let i = 0; i < slots.length; i += 1) {
      const id = picks[i];
      const item = id != null ? itemsById.get(id) : null;
      if (!item) continue;
      sum += Number(item.price) * Math.max(1, slots[i].minQty || 1);
    }
    return sum;
  }, [itemsById, picks, slots]);

  const ready = useMemo(() => {
    return slots.every((slot, idx) => {
      const id = picks[idx];
      return id != null && slot.itemIds.includes(id);
    });
  }, [picks, slots]);

  function addCombo() {
    if (!plate || !ready) return;
    for (let i = 0; i < slots.length; i += 1) {
      const itemId = picks[i];
      const item = itemsById.get(itemId);
      if (!item) continue;
      const qty = Math.max(1, slots[i].minQty || 1);
      for (let q = 0; q < qty; q += 1) {
        plate.add(item, item.variants?.[0]?.label ?? null);
      }
    }
    onClose();
  }

  return (
    <div
      className="fixed inset-x-0 top-0 z-[60] h-[100dvh] min-h-[100dvh]"
      role="dialog"
      aria-modal="true"
      aria-label="Build combo"
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

          {offer.imageUrl ? (
            <div className="mb-2 overflow-hidden rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={offer.imageUrl} alt="" className="h-24 w-full object-cover" />
            </div>
          ) : null}

          <div className="pr-8">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${chrome.badge}`}>
                <Layers className="h-2.5 w-2.5" aria-hidden />
                {offer.badgeLabel || "Combo"}
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${chrome.muted}`}>
                Build your combo
              </span>
            </div>
            <h3 className={`mt-1 text-base font-black leading-snug ${chrome.title}`}>{offer.title}</h3>
            {offer.subtitle ? (
              <p className={`mt-0.5 text-[12px] leading-snug ${chrome.muted}`}>{offer.subtitle}</p>
            ) : null}
            <div className={`mt-2 inline-flex flex-wrap items-baseline gap-1.5 rounded-xl px-2.5 py-1.5 ${chrome.panel}`}>
              <span className={`text-base font-black ${chrome.price}`}>
                {formatMoney(currencySymbol, rules.packagePrice)}
              </span>
              {rules.compareAtPrice || listSum > rules.packagePrice ? (
                <span className={`text-[11px] ${chrome.strike}`}>
                  {formatMoney(currencySymbol, rules.compareAtPrice || listSum)}
                </span>
              ) : null}
              {ready && listSum > rules.packagePrice ? (
                <span className={`text-[10px] font-bold ${chrome.muted}`}>
                  Save {formatMoney(currencySymbol, listSum - rules.packagePrice)}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain px-4 py-1">
          {slots.map((slot, idx) => (
            <div key={`${slot.label}-${idx}`} className={`rounded-xl p-2 ${chrome.panel}`}>
              <p className={`mb-1.5 text-[10px] font-bold uppercase tracking-wide ${chrome.muted}`}>
                {idx + 1}. {slot.label}
              </p>
              <div className="grid grid-cols-1 gap-1">
                {slot.itemIds.map((id) => {
                  const item = itemsById.get(id);
                  if (!item) return null;
                  const on = picks[idx] === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPicks((prev) => ({ ...prev, [idx]: id }))}
                      className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 text-left transition active:scale-[0.99] ${
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
                        <span className="block truncate text-[12px] font-bold leading-tight">{item.name}</span>
                        <span className={`mt-0.5 block text-[10px] ${on ? "opacity-80" : chrome.muted}`}>
                          {formatMoney(currencySymbol, item.price)}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div
          className="flex shrink-0 gap-2 border-t border-black/10 px-4 pt-2.5"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <button
            type="button"
            onClick={onClose}
            className={`flex-1 rounded-full border px-3 py-2 text-[12px] font-semibold ${chrome.chip}`}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!ready || !plate}
            onClick={addCombo}
            className={`flex-[1.4] rounded-full px-3 py-2 text-[12px] font-bold disabled:opacity-40 ${chrome.comboCta}`}
          >
            Add combo · {formatMoney(currencySymbol, rules.packagePrice)}
          </button>
        </div>
      </div>
    </div>
  );
}
