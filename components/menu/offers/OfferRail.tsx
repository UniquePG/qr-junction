"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgePercent,
  Gift,
  Layers,
  Sparkles,
  UtensilsCrossed,
  X,
} from "lucide-react";
import type {
  BogoRules,
  CollectionRules,
  ComboRules,
  GuestOfferDto,
  GuestOfferView,
  ItemDiscountRules,
  MenuOfferType,
} from "@/lib/offers/types";
import type { MenuItem } from "@/components/menu/types";
import type { ThemeOfferChrome } from "@/components/menu/themeChrome";
import { getThemeOfferChrome } from "@/components/menu/themeChrome";
import { formatMoney } from "@/components/menu/shared";
import { PlateSlot } from "@/components/menu/ordering/PlateControl";
import { usePlate } from "@/components/menu/ordering/PlateContext";
import { ComboAddSheet } from "./ComboAddSheet";
import { BogoClaimSheet } from "./BogoClaimSheet";
import { OfferDishesSheet } from "./OfferDishesSheet";
import { useOfferItemsById } from "./OfferContext";

const PREVIEW_LIMIT = 4;
const RAIL_PREVIEW = 4;

function offerHighlight(offer: GuestOfferDto, currencySymbol: string) {
  if (offer.type === "COMBO") {
    const rules = offer.rules as ComboRules;
    return rules?.packagePrice != null ? formatMoney(currencySymbol, rules.packagePrice) : null;
  }
  if (offer.type === "BOGO") return bogoHeadline(offer.rules as BogoRules);
  if (offer.type === "ITEM_DISCOUNT") {
    return discountHeadline(offer.rules as ItemDiscountRules, currencySymbol);
  }
  if (offer.type === "SPECIAL") return "Limited";
  if (offer.type === "COLLECTION") {
    const rules = offer.rules as CollectionRules;
    if (rules?.mode === "under_price" && rules.maxPrice != null) {
      return `Under ${formatMoney(currencySymbol, rules.maxPrice)}`;
    }
    return `${offer.itemIds.length} picks`;
  }
  return null;
}

function typeIcon(type: MenuOfferType) {
  switch (type) {
    case "COMBO":
      return Layers;
    case "BOGO":
      return Gift;
    case "ITEM_DISCOUNT":
      return BadgePercent;
    case "SPECIAL":
      return Sparkles;
    case "COLLECTION":
      return UtensilsCrossed;
    default:
      return Sparkles;
  }
}

function typeLabel(offer: GuestOfferDto) {
  if (offer.badgeLabel?.trim()) return offer.badgeLabel.trim();
  switch (offer.type) {
    case "COMBO":
      return "Combo";
    case "BOGO":
      return "Buy 1 Get 1";
    case "ITEM_DISCOUNT":
      return "Discount";
    case "SPECIAL":
      return "Special";
    case "COLLECTION":
      return "Collection";
    default:
      return "Offer";
  }
}

function discountHeadline(rules: ItemDiscountRules, currencySymbol: string) {
  if (rules.mode === "percent") return `${rules.value}% off`;
  return `${currencySymbol}${rules.value} off`;
}

function bogoHeadline(rules: BogoRules) {
  if (rules.getMode === "free") return `Buy ${rules.buyQty} · Get ${rules.getQty} free`;
  if (rules.getMode === "percent") {
    return `Buy ${rules.buyQty} · Get ${rules.getQty} at ${rules.getValue ?? 0}% off`;
  }
  return `Buy ${rules.buyQty} · Get ${rules.getQty} discounted`;
}

function discountedUnit(list: number, rules: ItemDiscountRules) {
  if (!Number.isFinite(list)) return null;
  if (rules.mode === "percent") return Math.max(0, Math.round(list * (1 - rules.value / 100) * 100) / 100);
  return Math.max(0, Math.round((list - rules.value) * 100) / 100);
}

function OfferItemTile({
  item,
  chrome,
  currencySymbol,
  onJump,
  offerPrice,
  listPrice,
  hint,
}: {
  item: MenuItem;
  chrome: ThemeOfferChrome;
  currencySymbol: string;
  onJump?: (itemId: number) => void;
  offerPrice?: number | null;
  listPrice?: number | null;
  hint?: string | null;
}) {
  const plate = usePlate();
  const canOrder = Boolean(plate?.enabled);
  const list = listPrice ?? Number(item.price);
  const showStrike =
    offerPrice != null && Number.isFinite(offerPrice) && Number.isFinite(list) && offerPrice < list;

  return (
    <div className={`group flex min-w-0 items-center gap-2 rounded-2xl border px-2.5 py-2 ${chrome.chip}`}>
      <button
        type="button"
        onClick={() => onJump?.(item.id)}
        className="flex min-w-0 flex-1 items-center gap-2.5 text-left transition active:scale-[0.98]"
      >
        <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-black/5">
          {item.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.image} alt="" className="h-full w-full object-cover transition group-hover:scale-105" />
          ) : (
            <span className={`flex h-full w-full items-center justify-center text-[11px] font-black ${chrome.muted}`}>
              {item.name.slice(0, 1).toUpperCase()}
            </span>
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12px] font-bold leading-snug">{item.name}</span>
          <span className={`mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold ${chrome.price}`}>
            {showStrike ? (
              <>
                <span className={chrome.strike}>{formatMoney(currencySymbol, list)}</span>
                <span>{formatMoney(currencySymbol, offerPrice)}</span>
              </>
            ) : (
              <span>{formatMoney(currencySymbol, list)}</span>
            )}
            {hint ? <span className={`font-bold ${chrome.muted}`}>· {hint}</span> : null}
          </span>
        </span>
        {!canOrder ? (
          <ArrowRight
            className={`h-3.5 w-3.5 shrink-0 opacity-40 transition group-hover:translate-x-0.5 group-hover:opacity-80 ${chrome.muted}`}
          />
        ) : null}
      </button>
      {canOrder ? <PlateSlot item={item} inline align="end" /> : null}
    </div>
  );
}

function ItemPreviewGrid({
  itemIds,
  chrome,
  currencySymbol,
  itemsById,
  onJump,
  expanded,
  onToggle,
  getOfferPrice,
  getHint,
}: {
  itemIds: number[];
  chrome: ThemeOfferChrome;
  currencySymbol: string;
  itemsById: Map<number, MenuItem>;
  onJump?: (itemId: number) => void;
  expanded: boolean;
  onToggle: () => void;
  getOfferPrice?: (item: MenuItem) => number | null | undefined;
  getHint?: (item: MenuItem) => string | null | undefined;
}) {
  const items = useMemo(
    () => itemIds.map((id) => itemsById.get(id)).filter(Boolean) as MenuItem[],
    [itemIds, itemsById],
  );
  if (!items.length) return null;
  const visible = expanded ? items : items.slice(0, PREVIEW_LIMIT);
  const hidden = Math.max(0, items.length - PREVIEW_LIMIT);

  return (
    <div className="mt-3 space-y-2">
      <div className="grid grid-cols-1 gap-2">
        {visible.map((item) => (
          <OfferItemTile
            key={item.id}
            item={item}
            chrome={chrome}
            currencySymbol={currencySymbol}
            onJump={onJump}
            offerPrice={getOfferPrice?.(item)}
            listPrice={Number(item.price)}
            hint={getHint?.(item)}
          />
        ))}
      </div>
      {hidden > 0 ? (
        <button
          type="button"
          onClick={onToggle}
          className={`w-full rounded-2xl px-3 py-2.5 text-center text-[11px] font-bold transition active:scale-[0.99] ${chrome.panel} ${chrome.title}`}
        >
          {expanded ? "Show fewer dishes" : `Show all ${items.length} dishes`}
        </button>
      ) : null}
    </div>
  );
}

function ComboSlotPreview({
  offer,
  chrome,
  currencySymbol,
  itemsById,
  onJump,
  expanded,
}: {
  offer: GuestOfferDto;
  chrome: ThemeOfferChrome;
  currencySymbol: string;
  itemsById: Map<number, MenuItem>;
  onJump?: (itemId: number) => void;
  expanded: boolean;
}) {
  const rules = offer.rules as ComboRules;
  const slots = Array.isArray(rules?.slots) ? rules.slots : [];
  if (!slots.length) return null;

  return (
    <div className="mt-3 space-y-2.5">
      {slots.map((slot, idx) => {
        const items = slot.itemIds
          .map((id) => itemsById.get(id))
          .filter(Boolean) as MenuItem[];
        const visible = expanded ? items : items.slice(0, 3);
        return (
          <div key={`${slot.label}-${idx}`} className={`rounded-2xl p-2.5 ${chrome.panel}`}>
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className={`text-[10px] font-black uppercase tracking-[0.14em] ${chrome.muted}`}>
                {idx + 1}. {slot.label}
              </p>
              <p className={`text-[10px] font-semibold ${chrome.muted}`}>
                {items.length} {items.length === 1 ? "choice" : "choices"}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {visible.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onJump?.(item.id)}
                  className={`flex items-center justify-between gap-2 rounded-xl border px-2.5 py-2 text-left text-[12px] font-semibold ${chrome.chip}`}
                >
                  <span className="truncate">{item.name}</span>
                  <span className={chrome.muted}>{formatMoney(currencySymbol, item.price)}</span>
                </button>
              ))}
              {!expanded && items.length > 3 ? (
                <p className={`px-1 text-[10px] font-semibold ${chrome.muted}`}>
                  +{items.length - 3} more in builder
                </p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PromoCard({
  offer,
  chrome,
  currencySymbol,
  orderingEnabled,
  onJump,
  onBuildCombo,
  onClaimBogo,
  onBrowseDishes,
  itemsById,
}: {
  offer: GuestOfferDto;
  chrome: ThemeOfferChrome;
  currencySymbol: string;
  orderingEnabled?: boolean;
  onJump?: (itemId: number) => void;
  onBuildCombo: (offer: GuestOfferDto) => void;
  onClaimBogo: (offer: GuestOfferDto) => void;
  onBrowseDishes: (offer: GuestOfferDto) => void;
  itemsById: Map<number, MenuItem>;
}) {
  const [expanded, setExpanded] = useState(false);
  const Icon = typeIcon(offer.type);

  let highlight: string | null = null;
  let packagePrice: number | null = null;
  let compareAt: number | null = null;

  if (offer.type === "COMBO") {
    const rules = offer.rules as ComboRules;
    packagePrice = rules?.packagePrice ?? null;
    compareAt = rules?.compareAtPrice ?? null;
    highlight = packagePrice != null ? formatMoney(currencySymbol, packagePrice) : null;
  } else if (offer.type === "BOGO") {
    highlight = bogoHeadline(offer.rules as BogoRules);
  } else if (offer.type === "ITEM_DISCOUNT") {
    highlight = discountHeadline(offer.rules as ItemDiscountRules, currencySymbol);
  } else if (offer.type === "SPECIAL") {
    highlight = "Limited";
  }

  const discountRules = offer.type === "ITEM_DISCOUNT" ? (offer.rules as ItemDiscountRules) : null;
  const bogoRules = offer.type === "BOGO" ? (offer.rules as BogoRules) : null;

  return (
    <article className={`relative overflow-hidden rounded-[1.35rem] transition ${chrome.card}`}>
      <div className={`absolute inset-y-0 left-0 w-1.5 ${chrome.accent}`} aria-hidden />

      {offer.imageUrl ? (
        <div className="relative h-36 overflow-hidden sm:h-40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={offer.imageUrl} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider shadow-sm ${chrome.badge}`}>
              <Icon className="h-3 w-3" aria-hidden />
              {typeLabel(offer)}
            </span>
            {highlight ? (
              <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-black text-slate-900 shadow-sm">
                {highlight}
              </span>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="p-4 pl-5">
        {!offer.imageUrl ? (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${chrome.badge}`}
                >
                  <Icon className="h-3 w-3" aria-hidden />
                  {typeLabel(offer)}
                </span>
                {highlight && offer.type !== "COMBO" ? (
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${chrome.panel} ${chrome.price}`}>
                    {highlight}
                  </span>
                ) : null}
              </div>
            </div>
            {offer.type === "COMBO" && packagePrice != null ? (
              <div className={`shrink-0 rounded-2xl px-3 py-2 text-right ${chrome.panel}`}>
                <p className={`text-[10px] font-bold uppercase tracking-wide ${chrome.muted}`}>Combo</p>
                <p className={`text-lg font-black leading-none ${chrome.price}`}>
                  {formatMoney(currencySymbol, packagePrice)}
                </p>
                {compareAt != null && compareAt > packagePrice ? (
                  <p className={`mt-1 text-[11px] ${chrome.strike}`}>{formatMoney(currencySymbol, compareAt)}</p>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : offer.type === "COMBO" && packagePrice != null ? (
          <div className={`mb-3 inline-flex items-baseline gap-2 rounded-2xl px-3 py-2 ${chrome.panel}`}>
            <span className={`text-lg font-black ${chrome.price}`}>{formatMoney(currencySymbol, packagePrice)}</span>
            {compareAt != null && compareAt > packagePrice ? (
              <span className={`text-xs ${chrome.strike}`}>{formatMoney(currencySymbol, compareAt)}</span>
            ) : null}
          </div>
        ) : null}

        <h3 className={`text-[18px] font-black leading-snug tracking-tight ${chrome.title}`}>{offer.title}</h3>
        {offer.subtitle ? (
          <p className={`mt-1 text-[12.5px] leading-relaxed ${chrome.muted}`}>{offer.subtitle}</p>
        ) : null}

        {offer.type === "COMBO" ? (
          <ComboSlotPreview
            offer={offer}
            chrome={chrome}
            currencySymbol={currencySymbol}
            itemsById={itemsById}
            onJump={onJump}
            expanded={expanded}
          />
        ) : (
          <ItemPreviewGrid
            itemIds={offer.itemIds}
            chrome={chrome}
            currencySymbol={currencySymbol}
            itemsById={itemsById}
            onJump={onJump}
            expanded={expanded}
            onToggle={() => setExpanded((v) => !v)}
            getOfferPrice={
              discountRules
                ? (item) => discountedUnit(Number(item.price), discountRules)
                : undefined
            }
            getHint={
              bogoRules
                ? () => (bogoRules.getMode === "free" ? "deal item" : "on deal")
                : undefined
            }
          />
        )}

        {offer.type === "COMBO" && offer.itemIds.length > 3 ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className={`mt-2 w-full rounded-2xl px-3 py-2.5 text-center text-[11px] font-bold ${chrome.panel} ${chrome.title}`}
          >
            {expanded ? "Hide full combo list" : "See all combo dishes"}
          </button>
        ) : null}

        <div className="mt-3.5 flex flex-col gap-2 sm:flex-row">
          {offer.type === "COMBO" && orderingEnabled ? (
            <button
              type="button"
              onClick={() => onBuildCombo(offer)}
              className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2.5 text-[12px] font-bold transition active:scale-[0.98] ${chrome.comboCta}`}
            >
              Build combo
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </button>
          ) : null}
          {offer.type === "BOGO" && orderingEnabled ? (
            <button
              type="button"
              onClick={() => onClaimBogo(offer)}
              className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2.5 text-[12px] font-bold transition active:scale-[0.98] ${chrome.comboCta}`}
            >
              Claim deal
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </button>
          ) : null}
          {offer.type === "ITEM_DISCOUNT" || offer.type === "SPECIAL" || offer.type === "COMBO" ? (
            <button
              type="button"
              onClick={() => onBrowseDishes(offer)}
              className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border px-3 py-2.5 text-[12px] font-bold transition active:scale-[0.98] ${chrome.chip}`}
            >
              Browse dishes
              <ArrowRight className="h-3.5 w-3.5 opacity-60" aria-hidden />
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function CollectionCard({
  offer,
  chrome,
  currencySymbol,
  onJump,
  itemsById,
}: {
  offer: GuestOfferDto;
  chrome: ThemeOfferChrome;
  currencySymbol: string;
  onJump?: (itemId: number) => void;
  itemsById: Map<number, MenuItem>;
}) {
  const [expanded, setExpanded] = useState(false);
  const rules = offer.rules as CollectionRules;
  const maxPrice = rules?.mode === "under_price" ? rules.maxPrice : null;
  const count = offer.itemIds.length;

  return (
    <article className={`relative overflow-hidden rounded-[1.35rem] ${chrome.card}`}>
      {offer.imageUrl ? (
        <div className="relative h-28 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={offer.imageUrl} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <span className={`absolute bottom-3 left-3 inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${chrome.badge}`}>
            {typeLabel(offer)}
          </span>
        </div>
      ) : (
        <div className={`absolute inset-x-0 top-0 h-1.5 ${chrome.accent}`} aria-hidden />
      )}

      <div className="p-4">
        <div className="min-w-0">
          {!offer.imageUrl ? (
            <p className={`text-[10px] font-bold uppercase tracking-[0.14em] ${chrome.muted}`}>
              {maxPrice != null
                ? `Under ${formatMoney(currencySymbol, maxPrice)}`
                : `${count} ${count === 1 ? "pick" : "picks"}`}
            </p>
          ) : null}
          <h3 className={`mt-1 text-[17px] font-black leading-snug ${chrome.title}`}>{offer.title}</h3>
          {offer.subtitle ? (
            <p className={`mt-1 text-[12px] leading-relaxed ${chrome.muted}`}>{offer.subtitle}</p>
          ) : (
            <p className={`mt-1 text-[12px] ${chrome.muted}`}>
              {count} {count === 1 ? "dish" : "dishes"} on this board
            </p>
          )}
        </div>

        <ItemPreviewGrid
          itemIds={offer.itemIds}
          chrome={chrome}
          currencySymbol={currencySymbol}
          itemsById={itemsById}
          onJump={onJump}
          expanded={expanded}
          onToggle={() => setExpanded((v) => !v)}
        />
      </div>
    </article>
  );
}

function PromoRailCard({
  offer,
  chrome,
  currencySymbol,
  orderingEnabled,
  onBuildCombo,
  onClaimBogo,
  onBrowseDishes,
  onOpen,
}: {
  offer: GuestOfferDto;
  chrome: ThemeOfferChrome;
  currencySymbol: string;
  orderingEnabled?: boolean;
  onBuildCombo: (offer: GuestOfferDto) => void;
  onClaimBogo: (offer: GuestOfferDto) => void;
  onBrowseDishes: (offer: GuestOfferDto) => void;
  onOpen: (offer: GuestOfferDto) => void;
}) {
  const Icon = typeIcon(offer.type);
  const highlight = offerHighlight(offer, currencySymbol);
  const rules = offer.type === "COMBO" ? (offer.rules as ComboRules) : null;

  return (
    <article
      className={`relative flex w-[min(78vw,18.5rem)] shrink-0 flex-col overflow-hidden rounded-[1.25rem] ${chrome.card}`}
    >
      <div className={`absolute inset-y-0 left-0 w-1 ${chrome.accent}`} aria-hidden />
      {offer.imageUrl ? (
        <button type="button" onClick={() => onOpen(offer)} className="relative h-28 w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={offer.imageUrl} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
          <span className={`absolute bottom-2.5 left-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${chrome.badge}`}>
            <Icon className="h-2.5 w-2.5" aria-hidden />
            {typeLabel(offer)}
          </span>
        </button>
      ) : null}

      <div className="flex flex-1 flex-col p-3.5 pl-4">
        {!offer.imageUrl ? (
          <span className={`mb-2 inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${chrome.badge}`}>
            <Icon className="h-2.5 w-2.5" aria-hidden />
            {typeLabel(offer)}
          </span>
        ) : null}

        <button type="button" onClick={() => onOpen(offer)} className="min-w-0 text-left">
          <h3 className={`line-clamp-2 text-[15px] font-black leading-snug ${chrome.title}`}>{offer.title}</h3>
          {offer.subtitle ? (
            <p className={`mt-1 line-clamp-2 text-[11px] leading-relaxed ${chrome.muted}`}>{offer.subtitle}</p>
          ) : null}
        </button>

        {highlight ? (
          <p className={`mt-2 text-[13px] font-black ${chrome.price}`}>
            {highlight}
            {rules?.compareAtPrice != null &&
            rules.packagePrice != null &&
            rules.compareAtPrice > rules.packagePrice ? (
              <span className={`ml-2 text-[11px] font-semibold ${chrome.strike}`}>
                {formatMoney(currencySymbol, rules.compareAtPrice)}
              </span>
            ) : null}
          </p>
        ) : null}

        <div className="mt-auto flex flex-col gap-1.5 pt-3">
          {offer.type === "COMBO" && orderingEnabled ? (
            <button
              type="button"
              onClick={() => onBuildCombo(offer)}
              className={`inline-flex w-full items-center justify-center gap-1 rounded-full px-3 py-2 text-[11px] font-bold ${chrome.comboCta}`}
            >
              Build combo
              <ArrowRight className="h-3 w-3" aria-hidden />
            </button>
          ) : null}
          {offer.type === "BOGO" && orderingEnabled ? (
            <button
              type="button"
              onClick={() => onClaimBogo(offer)}
              className={`inline-flex w-full items-center justify-center gap-1 rounded-full px-3 py-2 text-[11px] font-bold ${chrome.comboCta}`}
            >
              Claim deal
              <ArrowRight className="h-3 w-3" aria-hidden />
            </button>
          ) : null}
          {offer.type === "ITEM_DISCOUNT" || offer.type === "SPECIAL" || offer.type === "COMBO" ? (
            <button
              type="button"
              onClick={() => onBrowseDishes(offer)}
              className={`inline-flex w-full items-center justify-center gap-1 rounded-full border px-3 py-2 text-[11px] font-bold ${chrome.chip}`}
            >
              Browse dishes
              <ArrowRight className="h-3 w-3 opacity-60" aria-hidden />
            </button>
          ) : null}
          {offer.type === "BOGO" && !orderingEnabled ? (
            <button
              type="button"
              onClick={() => onOpen(offer)}
              className={`inline-flex w-full items-center justify-center gap-1 rounded-full border px-3 py-2 text-[11px] font-bold ${chrome.chip}`}
            >
              View deal
              <ArrowRight className="h-3 w-3 opacity-60" aria-hidden />
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function CollectionRailCard({
  offer,
  chrome,
  currencySymbol,
  onOpen,
}: {
  offer: GuestOfferDto;
  chrome: ThemeOfferChrome;
  currencySymbol: string;
  onOpen: (offer: GuestOfferDto) => void;
}) {
  const highlight = offerHighlight(offer, currencySymbol);
  return (
    <button
      type="button"
      onClick={() => onOpen(offer)}
      className={`relative flex w-[min(72vw,16.5rem)] shrink-0 flex-col overflow-hidden rounded-[1.25rem] text-left ${chrome.card}`}
    >
      {offer.imageUrl ? (
        <span className="relative h-24 w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={offer.imageUrl} alt="" className="h-full w-full object-cover" />
          <span className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </span>
      ) : (
        <span className={`absolute inset-x-0 top-0 h-1 ${chrome.accent}`} aria-hidden />
      )}
      <span className="p-3.5">
        <span className={`text-[9px] font-bold uppercase tracking-[0.14em] ${chrome.muted}`}>
          {typeLabel(offer)}
        </span>
        <span className={`mt-1 block line-clamp-2 text-[14px] font-black leading-snug ${chrome.title}`}>
          {offer.title}
        </span>
        {highlight ? <span className={`mt-2 block text-[13px] font-black ${chrome.price}`}>{highlight}</span> : null}
      </span>
    </button>
  );
}

function OffersAllSheet({
  title,
  eyebrow,
  offers,
  chrome,
  currencySymbol,
  theme,
  orderingEnabled,
  mode,
  onClose,
  onJump,
  onBuildCombo,
  onClaimBogo,
  onBrowseDishes,
  itemsById,
}: {
  title: string;
  eyebrow: string;
  offers: GuestOfferDto[];
  chrome: ThemeOfferChrome;
  currencySymbol: string;
  theme: string;
  orderingEnabled?: boolean;
  mode: "promo" | "collection";
  onClose: () => void;
  onJump?: (itemId: number) => void;
  onBuildCombo: (offer: GuestOfferDto) => void;
  onClaimBogo: (offer: GuestOfferDto) => void;
  onBrowseDishes: (offer: GuestOfferDto) => void;
  itemsById: Map<number, MenuItem>;
}) {
  const openItem = (itemId: number) => {
    onClose();
    // Let the sheet unmount before the dish modal mounts above it.
    window.setTimeout(() => onJump?.(itemId), 0);
  };

  return (
    <div
      className="fixed inset-x-0 top-0 z-[60] h-[100dvh] min-h-[100dvh]"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button type="button" className="absolute inset-0 bg-black/60" onClick={onClose} aria-label="Close" />
      <div
        className={`absolute inset-x-0 bottom-0 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl sm:inset-x-auto sm:left-1/2 sm:w-full sm:max-w-lg sm:-translate-x-1/2 ${chrome.card}`}
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
          <p className={`pr-10 text-[10px] font-bold uppercase tracking-[0.16em] ${chrome.muted}`}>{eyebrow}</p>
          <h3 className={`mt-1 pr-10 text-lg font-black ${chrome.title}`}>{title}</h3>
          <p className={`mt-0.5 text-[12px] ${chrome.muted}`}>
            {offers.length} {offers.length === 1 ? "offer" : "offers"}
          </p>
        </div>
        <div
          className="min-h-0 flex-1 space-y-3.5 overflow-y-auto overscroll-contain px-4 py-2"
          style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
        >
          {mode === "promo"
            ? offers.map((offer) => (
                <PromoCard
                  key={offer.id}
                  offer={offer}
                  chrome={chrome}
                  currencySymbol={currencySymbol}
                  orderingEnabled={orderingEnabled}
                  onJump={openItem}
                  onBuildCombo={(row) => {
                    onClose();
                    onBuildCombo(row);
                  }}
                  onClaimBogo={(row) => {
                    onClose();
                    onClaimBogo(row);
                  }}
                  onBrowseDishes={(row) => {
                    onClose();
                    onBrowseDishes(row);
                  }}
                  itemsById={itemsById}
                />
              ))
            : offers.map((offer) => (
                <CollectionCard
                  key={offer.id}
                  offer={offer}
                  chrome={chrome}
                  currencySymbol={currencySymbol}
                  onJump={openItem}
                  itemsById={itemsById}
                />
              ))}
        </div>
      </div>
    </div>
  );
}

export function OfferRail({
  offers,
  theme,
  currencySymbol,
  orderingEnabled,
  onJumpToItem,
}: {
  offers: GuestOfferView | null | undefined;
  theme: string;
  currencySymbol: string;
  orderingEnabled?: boolean;
  onJumpToItem?: (itemId: number) => void;
}) {
  const [combo, setCombo] = useState<GuestOfferDto | null>(null);
  const [bogo, setBogo] = useState<GuestOfferDto | null>(null);
  const [browse, setBrowse] = useState<GuestOfferDto | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [focusOffer, setFocusOffer] = useState<GuestOfferDto | null>(null);
  const itemsById = useOfferItemsById();
  const chrome = getThemeOfferChrome(theme);

  const promoOffers = useMemo(
    () => (offers?.rail || []).filter((o) => o.type !== "COLLECTION"),
    [offers?.rail],
  );
  const railOffers = promoOffers.slice(0, RAIL_PREVIEW);

  if (!promoOffers.length) return null;

  return (
    <>
      <section className="overflow-hidden" aria-label="Offers">
        <div className="mb-3 flex items-end justify-between gap-3 px-0.5">
          <div className="min-w-0">
            <p className={`text-[10px] font-bold uppercase tracking-[0.16em] ${chrome.muted}`}>Promotions</p>
            <h2 className={`text-lg font-black tracking-tight ${chrome.title}`}>Today&apos;s offers</h2>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <p className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${chrome.panel} ${chrome.muted}`}>
              {promoOffers.length} live
            </p>
            {promoOffers.length > 1 ? (
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${chrome.chip}`}
              >
                View all
                <ArrowRight className="h-3 w-3" aria-hidden />
              </button>
            ) : null}
          </div>
        </div>

        <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {railOffers.map((offer) => (
            <PromoRailCard
              key={offer.id}
              offer={offer}
              chrome={chrome}
              currencySymbol={currencySymbol}
              orderingEnabled={orderingEnabled}
              onBuildCombo={setCombo}
              onClaimBogo={setBogo}
              onBrowseDishes={setBrowse}
              onOpen={(row) => {
                setFocusOffer(row);
                setShowAll(true);
              }}
            />
          ))}
          {promoOffers.length > RAIL_PREVIEW ? (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className={`flex w-[8.5rem] shrink-0 flex-col items-center justify-center gap-2 rounded-[1.25rem] border border-dashed px-3 text-center ${chrome.chip}`}
            >
              <span className={`text-[12px] font-black ${chrome.title}`}>+{promoOffers.length - RAIL_PREVIEW}</span>
              <span className={`text-[11px] font-bold ${chrome.muted}`}>View all offers</span>
            </button>
          ) : null}
        </div>
      </section>

      {showAll ? (
        <OffersAllSheet
          title="All offers"
          eyebrow="Promotions"
          offers={focusOffer ? [focusOffer, ...promoOffers.filter((o) => o.id !== focusOffer.id)] : promoOffers}
          chrome={chrome}
          currencySymbol={currencySymbol}
          theme={theme}
          orderingEnabled={orderingEnabled}
          mode="promo"
          onClose={() => {
            setShowAll(false);
            setFocusOffer(null);
          }}
          onJump={onJumpToItem}
          onBuildCombo={setCombo}
          onClaimBogo={setBogo}
          onBrowseDishes={setBrowse}
          itemsById={itemsById}
        />
      ) : null}

      {combo ? (
        <ComboAddSheet
          offer={combo}
          currencySymbol={currencySymbol}
          theme={theme}
          onClose={() => setCombo(null)}
        />
      ) : null}
      {bogo ? (
        <BogoClaimSheet
          offer={bogo}
          currencySymbol={currencySymbol}
          theme={theme}
          onClose={() => setBogo(null)}
        />
      ) : null}
      {browse ? (
        <OfferDishesSheet
          offer={browse}
          currencySymbol={currencySymbol}
          theme={theme}
          onClose={() => setBrowse(null)}
          onSelectItem={onJumpToItem}
        />
      ) : null}
    </>
  );
}

export function CollectionStrip({
  offers,
  theme,
  currencySymbol = "₹",
  onJumpToItem,
}: {
  offers: GuestOfferView | null | undefined;
  theme: string;
  currencySymbol?: string;
  onJumpToItem?: (itemId: number) => void;
}) {
  const collections = offers?.collections || [];
  const itemsById = useOfferItemsById();
  const [showAll, setShowAll] = useState(false);
  const [focusOffer, setFocusOffer] = useState<GuestOfferDto | null>(null);
  const chrome = getThemeOfferChrome(theme);
  if (!collections.length) return null;
  const railOffers = collections.slice(0, RAIL_PREVIEW);

  return (
    <>
      <section className="overflow-hidden" aria-label="Value collections">
        <div className="mb-3 flex items-end justify-between gap-3 px-0.5">
          <div className="min-w-0">
            <p className={`text-[10px] font-bold uppercase tracking-[0.16em] ${chrome.muted}`}>Value picks</p>
            <h2 className={`text-base font-black tracking-tight ${chrome.title}`}>Under & collections</h2>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <p className={`text-[11px] font-semibold ${chrome.muted}`}>{collections.length} boards</p>
            {collections.length > 1 ? (
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${chrome.chip}`}
              >
                View all
                <ArrowRight className="h-3 w-3" aria-hidden />
              </button>
            ) : null}
          </div>
        </div>
        <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {railOffers.map((col) => (
            <CollectionRailCard
              key={col.id}
              offer={col}
              chrome={chrome}
              currencySymbol={currencySymbol}
              onOpen={(row) => {
                setFocusOffer(row);
                setShowAll(true);
              }}
            />
          ))}
          {collections.length > RAIL_PREVIEW ? (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className={`flex w-[8.5rem] shrink-0 flex-col items-center justify-center gap-2 rounded-[1.25rem] border border-dashed px-3 text-center ${chrome.chip}`}
            >
              <span className={`text-[12px] font-black ${chrome.title}`}>+{collections.length - RAIL_PREVIEW}</span>
              <span className={`text-[11px] font-bold ${chrome.muted}`}>View all</span>
            </button>
          ) : null}
        </div>
      </section>

      {showAll ? (
        <OffersAllSheet
          title="All collections"
          eyebrow="Value picks"
          offers={focusOffer ? [focusOffer, ...collections.filter((o) => o.id !== focusOffer.id)] : collections}
          chrome={chrome}
          currencySymbol={currencySymbol}
          theme={theme}
          mode="collection"
          onClose={() => {
            setShowAll(false);
            setFocusOffer(null);
          }}
          onJump={onJumpToItem}
          onBuildCombo={() => undefined}
          onClaimBogo={() => undefined}
          onBrowseDishes={() => undefined}
          itemsById={itemsById}
        />
      ) : null}
    </>
  );
}
