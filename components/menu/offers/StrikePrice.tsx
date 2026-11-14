"use client";

import { formatMoney } from "@/components/menu/shared";
import { getThemeOfferChrome } from "@/components/menu/themeChrome";
import { useItemOffer } from "./OfferContext";

export function StrikePrice({
  itemId,
  listPrice,
  symbol,
  theme,
  className = "",
}: {
  itemId?: number | null;
  listPrice: any;
  symbol: string;
  theme?: string;
  className?: string;
}) {
  const offer = useItemOffer(itemId);
  const chrome = getThemeOfferChrome(theme || "modern");
  const list = Number(listPrice);
  const offerPrice =
    offer?.offerUnitPrice != null && Number.isFinite(offer.offerUnitPrice)
      ? offer.offerUnitPrice
      : null;

  if (offerPrice != null && offerPrice < list) {
    return (
      <span className={`inline-flex items-baseline gap-1.5 ${className}`}>
        <span className={chrome.strike}>{formatMoney(symbol, list)}</span>
        <span className={chrome.price}>{formatMoney(symbol, offerPrice)}</span>
      </span>
    );
  }

  return <span className={className}>{formatMoney(symbol, listPrice)}</span>;
}
