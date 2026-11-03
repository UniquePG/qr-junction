"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_MENU_LOCALE,
  MENU_I18N_NATIVE_LABELS,
  isMenuLocaleCode,
  type MenuLocaleCode,
} from "@/lib/menu/i18n/locales";
import {
  pickLocalizedDescription,
  pickLocalizedName,
  pickLocalizedVariants,
} from "@/lib/menu/i18n/resolve";
import {
  guestStatusCopy,
  guestTagLabel,
  guestUiText,
  type GuestUiKey,
} from "@/lib/menu/i18n/guestUi";

export type GuestLocaleOption = {
  code: MenuLocaleCode;
  label: string;
  nativeLabel: string;
};

type RawItem = {
  id: number;
  name: string;
  description: string | null;
  // Prisma Decimal serializes to string/number; themes cast via Number(...)
  price: any;
  variants?: { label: string; price: number }[] | null;
  config?: { tags?: string[] } | null;
  i18n?: unknown;
  image: string | null;
  isAvailable: boolean;
  isVeg: boolean;
  isNonVeg: boolean;
  isVegan: boolean;
  isPopular: boolean;
};

type RawCategory = {
  id: number;
  name: string;
  i18n?: unknown;
  items: RawItem[];
};

type RawMenu = {
  id: number;
  name: string;
  description: string | null;
  theme: string;
  i18n?: unknown;
  categories: RawCategory[];
};

type RawRestaurant = {
  id: number;
  name: string;
  description: string | null;
  i18n?: unknown;
  logoUrl: string | null;
  coverImage: string | null;
  currency: string;
  taxRate: any;
  taxName: string;
  orderingEnabled?: boolean;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  website?: string | null;
  instagram?: string | null;
  openingHours?: unknown;
  showOpeningHours?: boolean;
};

type MenuLocaleContextValue = {
  locale: MenuLocaleCode;
  setLocale: (code: MenuLocaleCode) => void;
  locales: GuestLocaleOption[];
  t: (key: GuestUiKey) => string;
  tagLabel: (tagId: string, fallback: string) => string;
  statusCopy: (status: string, rejectReason?: string | null) => string;
  restaurant: RawRestaurant;
  menu: RawMenu;
};

const MenuLocaleContext = createContext<MenuLocaleContextValue | null>(null);

function storageKey(restaurantId: number) {
  return `qrj-menu-locale:${restaurantId}`;
}

function localizeItem(item: RawItem, locale: MenuLocaleCode): RawItem {
  return {
    ...item,
    name: pickLocalizedName(locale, item.name, item.i18n),
    description: pickLocalizedDescription(locale, item.description, item.i18n),
    variants: pickLocalizedVariants(locale, item.variants, item.i18n),
  };
}

function localizeMenu(menu: RawMenu, locale: MenuLocaleCode): RawMenu {
  // Keep menu title/description English (header + footer). Localize categories/items only.
  return {
    ...menu,
    categories: menu.categories.map((category) => ({
      ...category,
      name: pickLocalizedName(locale, category.name, category.i18n),
      items: category.items.map((item) => localizeItem(item, locale)),
    })),
  };
}

export function MenuLocaleProvider({
  restaurantId,
  locales,
  restaurant,
  menu,
  children,
}: {
  restaurantId: number;
  locales: GuestLocaleOption[];
  restaurant: RawRestaurant;
  menu: RawMenu;
  children: React.ReactNode;
}) {
  const available = locales.length
    ? locales
    : [{ code: DEFAULT_MENU_LOCALE, label: "English", nativeLabel: MENU_I18N_NATIVE_LABELS.en }];

  const [locale, setLocaleState] = useState<MenuLocaleCode>(() => {
    const first = available[0]?.code || DEFAULT_MENU_LOCALE;
    return first;
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey(restaurantId));
      if (isMenuLocaleCode(saved) && available.some((row) => row.code === saved)) {
        setLocaleState(saved);
        return;
      }
    } catch {
      /* ignore */
    }
    if (!available.some((row) => row.code === locale)) {
      setLocaleState(available[0]?.code || DEFAULT_MENU_LOCALE);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId, available.map((row) => row.code).join(",")]);

  const setLocale = (code: MenuLocaleCode) => {
    if (!available.some((row) => row.code === code)) return;
    setLocaleState(code);
    try {
      localStorage.setItem(storageKey(restaurantId), code);
    } catch {
      /* ignore */
    }
  };

  const value = useMemo<MenuLocaleContextValue>(() => {
    return {
      locale,
      setLocale,
      locales: available,
      t: (key) => guestUiText(locale, key),
      tagLabel: (tagId, fallback) => guestTagLabel(locale, tagId, fallback),
      statusCopy: (status, rejectReason) => guestStatusCopy(locale, status, rejectReason),
      // Restaurant brand / header fields stay English.
      restaurant,
      menu: localizeMenu(menu, locale),
    };
  }, [available, locale, menu, restaurant]);

  return <MenuLocaleContext.Provider value={value}>{children}</MenuLocaleContext.Provider>;
}

export function useMenuLocale() {
  const ctx = useContext(MenuLocaleContext);
  if (!ctx) {
    throw new Error("useMenuLocale must be used within MenuLocaleProvider");
  }
  return ctx;
}

export function useMenuLocaleOptional() {
  return useContext(MenuLocaleContext);
}
