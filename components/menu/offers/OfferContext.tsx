"use client";

import React, { createContext, useContext, useMemo } from "react";
import type { MenuItem } from "@/components/menu/types";
import type { GuestOfferView, GuestItemOffer } from "@/lib/offers/types";

type OfferCtxValue = {
  view: GuestOfferView | null;
  itemsById: Map<number, MenuItem>;
  theme: string;
};

const OfferCtx = createContext<OfferCtxValue>({
  view: null,
  itemsById: new Map(),
  theme: "modern",
});

export function OfferProvider({
  value,
  items,
  theme = "modern",
  children,
}: {
  value: GuestOfferView | null | undefined;
  items?: MenuItem[];
  theme?: string;
  children: React.ReactNode;
}) {
  const itemsById = useMemo(() => {
    const map = new Map<number, MenuItem>();
    for (const item of items || []) map.set(item.id, item);
    return map;
  }, [items]);

  const ctx = useMemo(
    () => ({ view: value || null, itemsById, theme }),
    [value, itemsById, theme],
  );

  return <OfferCtx.Provider value={ctx}>{children}</OfferCtx.Provider>;
}

export function useOffersOptional() {
  return useContext(OfferCtx).view;
}

export function useOfferTheme() {
  return useContext(OfferCtx).theme;
}

export function useOfferItemsById() {
  return useContext(OfferCtx).itemsById;
}

export function useItemOffer(itemId: number | undefined | null): GuestItemOffer | null {
  const { view } = useContext(OfferCtx);
  if (!view || itemId == null) return null;
  return view.itemOffers[String(itemId)] || null;
}
