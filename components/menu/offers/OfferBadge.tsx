"use client";

import { getThemeOfferChrome } from "@/components/menu/themeChrome";
import { useItemOffer } from "./OfferContext";

export function OfferBadge({
  itemId,
  theme,
  className = "",
}: {
  itemId?: number | null;
  theme?: string;
  className?: string;
}) {
  const offer = useItemOffer(itemId);
  if (!offer) return null;
  const chrome = getThemeOfferChrome(theme || "modern");
  return (
    <span
      className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${chrome.badge} ${className}`}
    >
      {offer.badgeLabel}
    </span>
  );
}
