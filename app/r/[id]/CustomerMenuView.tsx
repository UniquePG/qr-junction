'use client';

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  Sparkles,
  Utensils,
  X,
  Compass,
  Star,
  Award,
  Flame,
  Languages,
  ChevronDown,
  Check,
} from 'lucide-react';
import { getThemeChrome } from '@/components/menu/themeChrome';
import { getMenuTheme, isMenuTheme } from '@/components/menu/themeCatalog';
import EditorialTheme from '@/components/menu/themes/EditorialTheme';
import TicketTheme from '@/components/menu/themes/TicketTheme';
import NeonTheme from '@/components/menu/themes/NeonTheme';
import ThaliTheme from '@/components/menu/themes/ThaliTheme';
import GardenTheme from '@/components/menu/themes/GardenTheme';
import PolaroidTheme from '@/components/menu/themes/PolaroidTheme';
import BoardTheme from '@/components/menu/themes/BoardTheme';
import LanternTheme from '@/components/menu/themes/LanternTheme';
import StampTheme from '@/components/menu/themes/StampTheme';
import BentoTheme from '@/components/menu/themes/BentoTheme';
import PlaybillTheme from '@/components/menu/themes/PlaybillTheme';
import { PlateProvider } from '@/components/menu/ordering/PlateContext';
import { DishOrderActions, PlateSlot } from '@/components/menu/ordering/PlateControl';
import { MenuPlaceDetails } from '@/components/menu/PlaceDetails';
import { ItemTags } from '@/components/menu/ItemTags';
import { OfferProvider } from '@/components/menu/offers/OfferContext';
import { CollectionStrip, OfferRail } from '@/components/menu/offers/OfferRail';
import { ItemPrice } from '@/components/menu/shared';
import {
  MenuLocaleProvider,
  useMenuLocale,
  type GuestLocaleOption,
} from '@/components/menu/i18n/MenuLocaleProvider';
import { formatTableLabel } from '@/lib/orders/displayId';
import type { GuestOfferView } from '@/lib/offers/types';

type PriceConstraint =
  | { kind: 'exact'; value: number }
  | { kind: 'max'; value: number }
  | { kind: 'min'; value: number };

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\p{L}\p{N}.\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parsePriceNumber(raw: string) {
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function pricesClose(a: number, b: number) {
  return Math.abs(a - b) < 0.009;
}

function itemPriceList(item: MenuItem): number[] {
  const prices: number[] = [];
  const base = Number(item.price);
  if (Number.isFinite(base)) prices.push(base);
  for (const variant of item.variants || []) {
    const price = Number(variant.price);
    if (Number.isFinite(price)) prices.push(price);
  }
  return prices;
}

function parseMenuSearch(raw: string): { tokens: string[]; price: PriceConstraint | null } {
  const trimmed = raw.trim();
  if (!trimmed) return { tokens: [], price: null };

  const currencyStripped = trimmed
    .replace(/[₹$€£]/g, ' ')
    .replace(/\brs\.?\b/gi, ' ')
    .replace(/\binr\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const onlyPrice = currencyStripped.match(/^(\d+(?:\.\d+)?)$/);
  if (onlyPrice) {
    const value = parsePriceNumber(onlyPrice[1]);
    return { tokens: [], price: value == null ? null : { kind: 'exact', value } };
  }

  let working = currencyStripped;
  let price: PriceConstraint | null = null;

  const maxMatch = working.match(
    /\b(?:under|below|upto|up\s*to|less\s*than|max|at\s*most|<=|<)\s*(\d+(?:\.\d+)?)\b/i,
  );
  const minMatch = working.match(
    /\b(?:over|above|from|at\s*least|min|more\s*than|>=|>)\s*(\d+(?:\.\d+)?)\b/i,
  );

  if (maxMatch) {
    const value = parsePriceNumber(maxMatch[1]);
    if (value != null) {
      price = { kind: 'max', value };
      working = working.replace(maxMatch[0], ' ');
    }
  } else if (minMatch) {
    const value = parsePriceNumber(minMatch[1]);
    if (value != null) {
      price = { kind: 'min', value };
      working = working.replace(minMatch[0], ' ');
    }
  } else {
    const trailingPrice = working.match(/(?:^|\s)(\d+(?:\.\d+)?)(?:\s*)$/);
    if (trailingPrice) {
      const value = parsePriceNumber(trailingPrice[1]);
      const before = working.slice(0, trailingPrice.index).trim();
      if (value != null && before.length > 0) {
        price = { kind: 'exact', value };
        working = before;
      }
    }
  }

  const tokens = normalizeSearchText(working)
    .split(' ')
    .filter((token) => token.length > 0);

  return { tokens, price };
}

function matchesPriceConstraint(prices: number[], constraint: PriceConstraint | null) {
  if (!constraint) return true;
  if (!prices.length) return false;
  if (constraint.kind === 'exact') return prices.some((price) => pricesClose(price, constraint.value));
  if (constraint.kind === 'max') return prices.some((price) => price <= constraint.value + 0.009);
  return prices.some((price) => price >= constraint.value - 0.009);
}

function itemMatchesMenuSearch(
  item: MenuItem,
  categoryName: string,
  query: string,
  tagLabels: string[],
) {
  const parsed = parseMenuSearch(query);
  if (!parsed.tokens.length && !parsed.price) return true;

  const prices = itemPriceList(item);
  if (!matchesPriceConstraint(prices, parsed.price)) return false;
  if (!parsed.tokens.length) return true;

  const haystack = normalizeSearchText(
    [
      item.name,
      item.description || '',
      categoryName,
      ...(item.variants || []).map((variant) => variant.label),
      ...(item.config?.tags || []),
      ...tagLabels,
      item.isVeg || item.isVegan ? 'veg vegetarian' : '',
      item.isNonVeg ? 'nonveg non-veg non vegetarian' : '',
      item.isVegan ? 'vegan' : '',
      item.isPopular ? 'popular bestseller' : '',
    ].join(' '),
  );

  return parsed.tokens.every((token) => haystack.includes(token));
}

interface MenuItem {
  id: number;
  name: string;
  description: string | null;
  price: any; // Decimal type from Prisma
  variants?: { label: string; price: number }[] | null;
  config?: { tags?: string[] } | null;
  i18n?: unknown;
  image: string | null;
  isAvailable: boolean;
  isVeg: boolean;
  isNonVeg: boolean;
  isVegan: boolean;
  isPopular: boolean;
}

interface MenuCategory {
  id: number;
  name: string;
  i18n?: unknown;
  items: MenuItem[];
}

interface Restaurant {
  id: number;
  name: string;
  description: string | null;
  i18n?: unknown;
  logoUrl: string | null;
  coverImage: string | null;
  currency: string;
  taxRate: any; // Decimal type
  taxName: string;
  orderingEnabled?: boolean;
  orderingPaused?: boolean;
  orderingUnlocked?: boolean;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  website?: string | null;
  instagram?: string | null;
  openingHours?: unknown;
  showOpeningHours?: boolean;
}

interface Menu {
  id: number;
  name: string;
  description: string | null;
  theme: string;
  i18n?: unknown;
  categories: MenuCategory[];
}

interface CustomerMenuViewProps {
  restaurant: Restaurant;
  menu: Menu;
  tableNumber: string | null;
  layoutPreview?: string | null;
  locales?: GuestLocaleOption[];
  offers?: GuestOfferView | null;
}

export default function CustomerMenuView(props: CustomerMenuViewProps) {
  return (
    <MenuLocaleProvider
      restaurantId={props.restaurant.id}
      locales={props.locales || []}
      restaurant={props.restaurant}
      menu={props.menu}
    >
      <CustomerMenuViewInner
        tableNumber={props.tableNumber}
        layoutPreview={props.layoutPreview}
        offers={props.offers}
      />
    </MenuLocaleProvider>
  );
}

function CustomerMenuViewInner({
  tableNumber,
  layoutPreview,
  offers,
}: {
  tableNumber: string | null;
  layoutPreview?: string | null;
  offers?: GuestOfferView | null;
}) {
  const { restaurant, menu, t, tagLabel, locales, locale, setLocale } = useMenuLocale();
  const [search, setSearch] = useState('');
  const [dietFilter, setDietFilter] = useState<'ALL' | 'VEG' | 'NON_VEG'>('ALL');
  const [popularFilter, setPopularFilter] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [langOpen, setLangOpen] = useState(false);
  const [langMenuStyle, setLangMenuStyle] = useState<React.CSSProperties>({});
  const langRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLUListElement>(null);
  const orderingEnabled = !layoutPreview && Boolean(restaurant.orderingEnabled);

  useEffect(() => {
    setSelectedVariant(selectedItem?.variants?.[0]?.label ?? null);
  }, [selectedItem]);

  useLayoutEffect(() => {
    if (!langOpen) return;
    const place = () => {
      const trigger = langRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const menuWidth = Math.max(168, rect.width);
      const gap = 6;
      const estimatedHeight = Math.min(locales.length * 44 + 8, 280);
      const spaceBelow = window.innerHeight - rect.bottom - gap;
      const openUp = spaceBelow < estimatedHeight && rect.top > spaceBelow;
      const left = Math.min(
        Math.max(8, rect.right - menuWidth),
        window.innerWidth - menuWidth - 8,
      );
      setLangMenuStyle({
        position: 'fixed',
        left,
        width: menuWidth,
        zIndex: 80,
        ...(openUp
          ? { bottom: window.innerHeight - rect.top + gap, top: 'auto' }
          : { top: rect.bottom + gap, bottom: 'auto' }),
        maxHeight: Math.max(120, openUp ? rect.top - gap - 8 : spaceBelow - 8),
      });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [langOpen, locales.length]);

  useEffect(() => {
    if (!langOpen) return;
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (langRef.current?.contains(target)) return;
      if (langMenuRef.current?.contains(target)) return;
      setLangOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLangOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [langOpen]);

  const currencySymbol = useMemo(() => {
    switch (restaurant.currency) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'AED': return 'AED ';
      default: return '₹';
    }
  }, [restaurant.currency]);

  // Filter items in each category
  const filteredCategories = useMemo(() => {
    return menu.categories.map((cat) => {
      const items = cat.items.filter((item) => {
        if (!item.isAvailable) return false;

        const tagLabels = (item.config?.tags || []).map((tagId) =>
          tagLabel(tagId, tagId.replace(/_/g, ' ')),
        );
        const matchesSearch = itemMatchesMenuSearch(item, cat.name, search, tagLabels);

        let matchesDiet = true;
        if (dietFilter === 'VEG') {
          matchesDiet = item.isVeg || item.isVegan;
        } else if (dietFilter === 'NON_VEG') {
          matchesDiet = item.isNonVeg;
        }

        const matchesPopular = !popularFilter || item.isPopular;

        return matchesSearch && matchesDiet && matchesPopular;
      });

      return {
        ...cat,
        items
      };
    }).filter(cat => cat.items.length > 0);
  }, [menu.categories, search, dietFilter, popularFilter, tagLabel]);

  const handleCategoryClick = (id: number) => {
    setActiveCategoryId(id);
    const el = document.getElementById(`cat-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    if (!filteredCategories.length) {
      setActiveCategoryId(null);
      return;
    }
    if (!activeCategoryId || !filteredCategories.some((cat) => cat.id === activeCategoryId)) {
      setActiveCategoryId(filteredCategories[0].id);
    }
  }, [filteredCategories, activeCategoryId]);

  const allItems = useMemo(
    () => menu.categories.flatMap((cat) => cat.items),
    [menu.categories],
  );

  const jumpToOfferItem = (itemId: number) => {
    const item = allItems.find((row) => row.id === itemId);
    if (item) {
      setSelectedVariant(item.variants?.[0]?.label ?? null);
      setSelectedItem(item);
    }
  };

  const taxRate = parseFloat(restaurant.taxRate?.toString() || '0');
  const theme = menu.theme || 'modern';
  const chrome = getThemeChrome(theme);
  const hideCover = theme === 'ticket' || theme === 'neon' || theme === 'board' || theme === 'lantern' || theme === 'playbill';

  // 1. MODERN CARD LAYOUT
  const renderModern = () => (
    <div className="space-y-10">
      {filteredCategories.map((cat) => (
        <div key={cat.id} id={`cat-${cat.id}`} className="space-y-5 scroll-mt-40">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">{cat.name}</h3>
            <span className="text-xs bg-slate-100 text-slate-500 font-bold px-2.5 py-0.5 rounded-full">{cat.items.length} Items</span>
            <div className="flex-1 h-[1px] bg-slate-200/60" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {cat.items.map((item) => (
              <div 
                key={item.id} 
                className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex min-h-32 cursor-pointer group"
                onClick={() => setSelectedItem(item)}
              >
                <div className="flex min-w-0 flex-1 flex-col gap-2 p-3.5 sm:p-5">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-start gap-2 min-w-0">
                      {item.isVeg && (
                        <span className="mt-0.5 w-4 h-4 rounded border border-emerald-500 flex items-center justify-center shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        </span>
                      )}
                      {item.isNonVeg && (
                        <span className="mt-0.5 w-4 h-4 rounded border border-red-500 flex items-center justify-center shrink-0">
                          <span className="w-1.5 h-1.5 bg-red-500 rotate-45 transform" />
                        </span>
                      )}
                      <h4 className="font-extrabold text-slate-900 wrap-anywhere text-sm sm:text-base group-hover:text-primary transition-colors">{item.name}</h4>
                    </div>
                    {item.description && <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed font-sans">{item.description}</p>}
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      {item.variants && item.variants.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {item.variants.slice(0, 2).map((v: any, vi: number) => (
                            <span key={vi} className="text-[10px] font-extrabold text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg whitespace-nowrap">
                              {v.label} {currencySymbol}{Number(v.price).toFixed(0)}
                            </span>
                          ))}
                          {item.variants.length > 2 && (
                            <span className="text-[10px] font-bold text-slate-400 px-1 py-0.5">+ {item.variants.length - 2} more</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-base font-extrabold text-slate-950">
                          <ItemPrice item={item} symbol={currencySymbol} />
                        </span>
                      )}
                    </div>
                    {item.isPopular && (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-50/80 text-amber-600 text-[9px] font-black border border-amber-100 uppercase tracking-wider shrink-0">
                        <Sparkles className="w-3 h-3 fill-amber-500 text-amber-500" /> Bestseller
                      </span>
                    )}
                  </div>
                  <div className={`space-y-2 ${item.image ? "mt-auto" : "mt-1"}`}>
                    <ItemTags item={item} hidePopular />
                    <PlateSlot item={item} />
                  </div>
                </div>

                {item.image && (
                  <div className="w-28 self-stretch shrink-0 overflow-hidden relative bg-slate-50 sm:w-36">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  // 2. MINIMAL LIST LAYOUT
  const renderMinimal = () => (
    <div className="space-y-12 max-w-2xl mx-auto">
      {filteredCategories.map((cat) => (
        <div key={cat.id} id={`cat-${cat.id}`} className="space-y-6 scroll-mt-40">
          <div className="text-center space-y-1.5">
            <h3 className="text-xl font-bold tracking-widest text-slate-900 uppercase font-serif">{cat.name}</h3>
            <div className="w-12 h-[1px] bg-slate-300 mx-auto" />
          </div>
          
          <div className="space-y-6 divide-y divide-slate-100">
            {cat.items.map((item) => (
              <div 
                key={item.id} 
                className="pt-5 first:pt-0 flex flex-col gap-2 cursor-pointer group"
                onClick={() => setSelectedItem(item)}
              >
                <div className="flex items-baseline justify-between gap-3 min-w-0">
                  <h4 className="font-serif font-black text-slate-900 text-base sm:text-lg group-hover:text-primary transition-colors flex items-center gap-2 min-w-0 wrap-anywhere">
                    {item.isVeg && (
                      <span className="w-4 h-4 rounded border border-emerald-500 flex items-center justify-center shrink-0 bg-white">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      </span>
                    )}
                    {item.isNonVeg && (
                      <span className="w-4 h-4 rounded border border-red-500 flex items-center justify-center shrink-0 bg-white">
                        <span className="w-1.5 h-1.5 bg-red-500 rotate-45 transform" />
                      </span>
                    )}
                    {item.name}
                  </h4>
                  <div className="flex-1 border-b border-dotted border-slate-300 mx-2" />
                  {!item.variants || item.variants.length === 0 ? (
                    <span className="font-serif font-extrabold text-slate-905 text-base">
                      <ItemPrice item={item} symbol={currencySymbol} />
                    </span>
                  ) : null}
                </div>
                
                <div className="flex justify-between items-start gap-6">
                  {item.description && (
                    <p className="text-slate-500 text-xs italic font-sans max-w-xl leading-relaxed">
                      {item.description}
                    </p>
                  )}
                  {item.variants && item.variants.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-end shrink-0">
                      {item.variants.map((v: any, vi: number) => (
                        <span key={vi} className="text-xs font-serif font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded">
                          {v.label}: <span className="font-bold text-slate-950">{currencySymbol}{Number(v.price).toFixed(0)}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                {item.isPopular && (
                  <div className="text-[9px] text-amber-600 font-extrabold uppercase tracking-widest mt-0.5">
                    ★ chef's recommendation
                  </div>
                )}
                <div className="mt-2 space-y-2">
                  <ItemTags item={item} hidePopular />
                  <PlateSlot item={item} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  // 3. PREMIUM RESTAURANT LAYOUT
  const renderPremium = () => (
    <div className="space-y-14 max-w-4xl mx-auto">
      {filteredCategories.map((cat) => (
        <div key={cat.id} id={`cat-${cat.id}`} className="space-y-8 scroll-mt-40">
          <div className="text-center space-y-2">
            <h3 className="text-3xl font-serif text-amber-900 font-medium italic tracking-wide">{cat.name}</h3>
            <div className="flex items-center justify-center gap-3">
              <div className="w-16 h-[1px] bg-amber-305" />
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <div className="w-16 h-[1px] bg-amber-305" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {cat.items.map((item) => (
              <div 
                key={item.id} 
                className="bg-[#FCFAF4] border-2 border-double border-amber-200/80 p-5 rounded-3xl shadow-xs hover:border-amber-400 transition-all cursor-pointer flex gap-4"
                onClick={() => setSelectedItem(item)}
              >
                {item.image && (
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border border-amber-205 p-1 bg-white shrink-0 shadow-xs relative">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                  </div>
                )}
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-serif font-black text-amber-950 text-base wrap-anywhere flex items-center gap-2 min-w-0">
                        {item.isVeg && (
                          <span className="w-4 h-4 rounded border border-emerald-500 flex items-center justify-center shrink-0 bg-white">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          </span>
                        )}
                        {item.isNonVeg && (
                          <span className="w-4 h-4 rounded border border-red-500 flex items-center justify-center shrink-0 bg-white">
                            <span className="w-1.5 h-1.5 bg-red-500 rotate-45 transform" />
                          </span>
                        )}
                        {item.name}
                      </h4>
                      {!item.variants || item.variants.length === 0 ? (
                        <span className="font-serif text-base font-bold text-amber-800 shrink-0">
                          <ItemPrice item={item} symbol={currencySymbol} />
                        </span>
                      ) : null}
                    </div>
                    {item.description && <p className="text-slate-600 text-xs line-clamp-2 mt-1 leading-relaxed font-sans">{item.description}</p>}
                  </div>

                  {item.variants && item.variants.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {item.variants.map((v: any, vi: number) => (
                        <span key={vi} className="text-[10px] font-bold text-amber-900 bg-amber-50 border border-amber-200/50 px-2 py-0.5 rounded-lg whitespace-nowrap">
                          {v.label} {currencySymbol}{Number(v.price).toFixed(0)}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className={`space-y-2 border-t border-amber-100/40 pt-2 ${item.image ? "mt-auto" : ""}`}>
                    {item.isPopular && (
                      <span className="text-amber-700 font-extrabold flex items-center gap-0.5 text-[10px]">
                        <Award className="w-3.5 h-3.5 fill-amber-500 text-amber-600" /> Chef's Choice
                      </span>
                    )}
                    <ItemTags item={item} hidePopular />
                    <PlateSlot item={item} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  // 4. CAFE LAYOUT
  const renderCafe = () => (
    <div className="space-y-10">
      {filteredCategories.map((cat) => (
        <div key={cat.id} id={`cat-${cat.id}`} className="space-y-6 scroll-mt-40">
          <h3 className="text-xl font-black bg-slate-900 text-white py-2 px-5 rounded-2xl w-fit border-2 border-slate-900 shadow-[3px_3px_0px_#1e293b]">{cat.name}</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {cat.items.map((item) => (
              <div 
                key={item.id} 
                className="bg-white border-2 border-slate-900 p-4 sm:p-5 rounded-3xl shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all cursor-pointer flex flex-col gap-3 min-w-0"
                onClick={() => setSelectedItem(item)}
              >
                {item.image && (
                  <div className="h-36 w-full rounded-2xl overflow-hidden border-2 border-slate-900 bg-slate-100 shrink-0">
                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex justify-between items-start gap-4 min-w-0">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <h4 className="font-black text-slate-900 text-base flex items-center gap-2 wrap-anywhere min-w-0">
                      {item.isVeg && (
                        <span className="w-4 h-4 rounded border border-emerald-500 flex items-center justify-center shrink-0 bg-white">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        </span>
                      )}
                      {item.isNonVeg && (
                        <span className="w-4 h-4 rounded border border-red-500 flex items-center justify-center shrink-0 bg-white">
                          <span className="w-1.5 h-1.5 bg-red-500 rotate-45 transform" />
                        </span>
                      )}
                      {item.name}
                    </h4>
                    {item.description && <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">{item.description}</p>}
                  </div>
                  {!item.variants || item.variants.length === 0 ? (
                    <span className="bg-amber-400 text-slate-900 font-black px-3 py-1 rounded-xl text-sm border-2 border-slate-900 shrink-0 shadow-[2px_2px_0px_#1e293b]">
                      <ItemPrice item={item} symbol={currencySymbol} />
                    </span>
                  ) : null}
                </div>

                {item.variants && item.variants.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {item.variants.map((v: any, vi: number) => (
                      <span key={vi} className="bg-amber-100 text-slate-900 font-extrabold px-2.5 py-0.5 rounded-lg text-xs border border-slate-900 whitespace-nowrap">
                        {v.label} {currencySymbol}{Number(v.price).toFixed(0)}
                      </span>
                    ))}
                  </div>
                )}

                <div className="space-y-2 border-t border-dashed border-slate-200 pt-2">
                  <ItemTags item={item} hidePopular />
                  <div className="flex items-center justify-between gap-2">
                    {item.isPopular ? (
                      <span className="text-amber-600 flex items-center gap-0.5 text-[9px] font-black uppercase tracking-wider"><Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> Popular</span>
                    ) : (
                      <span className="text-xs font-bold text-slate-400">Available</span>
                    )}
                    <PlateSlot item={item} inline />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  // 5. GOURMET LUXURY LAYOUT (New Theme 1)
  const renderGourmet = () => (
    <div className="space-y-16">
      {filteredCategories.map((cat) => (
        <div key={cat.id} id={`cat-${cat.id}`} className="space-y-8 scroll-mt-40">
          <div className="text-center space-y-2.5">
            <h3 className="text-3xl font-serif text-amber-500 font-medium tracking-widest uppercase">{cat.name}</h3>
            <div className="flex items-center justify-center gap-4">
              <div className="w-24 h-[1px] bg-gradient-to-r from-transparent to-amber-500/50" />
              <Star className="w-4 h-4 text-amber-500 fill-amber-500/10" />
              <div className="w-24 h-[1px] bg-gradient-to-l from-transparent to-amber-500/50" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {cat.items.map((item) => (
              <div 
                key={item.id} 
                className="bg-[#12141c] border border-amber-900/30 rounded-3xl p-5 hover:border-amber-500/40 hover:shadow-[0_0_20px_rgba(217,119,6,0.1)] transition-all duration-300 cursor-pointer flex gap-4 relative overflow-hidden"
                onClick={() => setSelectedItem(item)}
              >
                {item.image && (
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border border-amber-950 bg-[#0c0d10] shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover filter brightness-95" />
                  </div>
                )}
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-serif font-black text-amber-100 text-base wrap-anywhere flex items-center gap-2 min-w-0">
                        {item.isVeg && (
                          <span className="w-4 h-4 rounded border border-emerald-500 flex items-center justify-center shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          </span>
                        )}
                        {item.isNonVeg && (
                          <span className="w-4 h-4 rounded border border-red-500 flex items-center justify-center shrink-0">
                            <span className="w-1.5 h-1.5 bg-red-500 rotate-45 transform" />
                          </span>
                        )}
                        {item.name}
                      </h4>
                      {!item.variants || item.variants.length === 0 ? (
                        <span className="font-serif text-base font-bold text-amber-500 shrink-0">
                          <ItemPrice item={item} symbol={currencySymbol} />
                        </span>
                      ) : null}
                    </div>
                    {item.description && <p className="text-slate-400 text-xs line-clamp-2 mt-1 leading-relaxed font-sans">{item.description}</p>}
                  </div>

                  {item.variants && item.variants.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {item.variants.map((v: any, vi: number) => (
                        <span key={vi} className="text-[10px] font-bold text-amber-500 bg-amber-500/5 border border-amber-500/20 px-2 py-0.5 rounded-lg whitespace-nowrap">
                          {v.label} {currencySymbol}{Number(v.price).toFixed(0)}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className={`space-y-2 border-t border-slate-800 pt-2 ${item.image ? "mt-auto" : ""}`}>
                    {item.isPopular ? (
                      <span className="text-amber-500 font-extrabold flex items-center gap-0.5 text-[9px] uppercase tracking-wider">
                        ★ Chef Recommend
                      </span>
                    ) : null}
                    <ItemTags item={item} hidePopular />
                    <PlateSlot item={item} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  // 6. STREET FOOD LAYOUT (New Theme 2)
  const renderStreet = () => (
    <div className="space-y-12">
      {filteredCategories.map((cat) => (
        <div key={cat.id} id={`cat-${cat.id}`} className="space-y-6 scroll-mt-40">
          <div className="flex items-center justify-between border-b border-orange-100 pb-2">
            <h3 className="text-xl font-black text-orange-950 tracking-tight flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-650 fill-orange-500" />
              {cat.name}
            </h3>
            <span className="text-xs font-bold text-orange-600 bg-orange-55/70 px-2.5 py-1 rounded-xl">{cat.items.length} items</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cat.items.map((item) => (
              <div 
                key={item.id} 
                className="bg-white rounded-3xl border border-orange-100/50 p-4 shadow-sm hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col gap-3 relative overflow-hidden group"
                onClick={() => setSelectedItem(item)}
              >
                {/* Image Banner */}
                {item.image ? (
                  <div className="h-36 sm:h-44 w-full rounded-2xl overflow-hidden relative bg-slate-50 shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    {item.isPopular && (
                      <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-0.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black uppercase tracking-wider shadow-sm">
                        <Flame className="w-3 h-3 fill-white" /> Popular
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="h-36 sm:h-44 w-full rounded-2xl bg-gradient-to-br from-orange-400/10 to-red-500/10 flex items-center justify-center shrink-0">
                    <Utensils className="w-8 h-8 text-orange-400" />
                  </div>
                )}

                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-black text-slate-900 text-base wrap-anywhere flex items-center gap-2 min-w-0">
                        {item.isVeg && (
                          <span className="w-4 h-4 rounded border border-emerald-500 flex items-center justify-center shrink-0 bg-white">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          </span>
                        )}
                        {item.isNonVeg && (
                          <span className="w-4 h-4 rounded border border-red-500 flex items-center justify-center shrink-0 bg-white">
                            <span className="w-1.5 h-1.5 bg-red-500 rotate-45 transform" />
                          </span>
                        )}
                        {item.name}
                      </h4>
                      {!item.variants || item.variants.length === 0 ? (
                        <span className="text-base font-black text-orange-600 shrink-0">
                          <ItemPrice item={item} symbol={currencySymbol} />
                        </span>
                      ) : null}
                    </div>
                    {item.description && <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed font-sans">{item.description}</p>}
                  </div>

                  {item.variants && item.variants.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {item.variants.map((v: any, vi: number) => (
                        <span key={vi} className="text-[10px] font-black text-white bg-gradient-to-r from-orange-500 to-red-500 px-2.5 py-0.5 rounded-lg whitespace-nowrap shadow-sm">
                          {v.label} {currencySymbol}{Number(v.price).toFixed(0)}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto space-y-2 border-t border-orange-50 pt-2">
                    {item.isVegan ? (
                      <span className="inline-flex text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">{t('vegan')}</span>
                    ) : null}
                    <ItemTags item={item} hidePopular />
                    <PlateSlot item={item} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <PlateProvider
      enabled={orderingEnabled}
      theme={theme}
      restaurantId={restaurant.id}
      menuId={menu.id}
      tableNumber={tableNumber}
      currencySymbol={currencySymbol}
      onOpenItem={(item) => {
        setSelectedVariant(item.variants?.[0]?.label ?? null);
        setSelectedItem(item);
      }}
    >
    <OfferProvider value={offers} items={allItems} theme={theme}>
    <div className={`min-h-screen overflow-x-clip transition-colors duration-300 relative font-sans ${chrome.page}`}>
      {layoutPreview && (
        <div className="sticky top-0 z-40 px-3 py-2 text-center text-[11px] font-bold leading-snug bg-[#001B50] text-white wrap-anywhere">
          Previewing {getMenuTheme(layoutPreview).name} — not applied to guests yet
        </div>
      )}
      {/* Cover Banner */}
      <div className={`${hideCover ? 'h-16 sm:h-20' : 'h-44 sm:h-56'} w-full bg-slate-200 relative`}>
        {restaurant.coverImage ? (
          <img src={restaurant.coverImage} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary/10 to-secondary/10" />
        )}
        <div className="absolute inset-0 bg-black/45" />
      </div>

      {/* Brand Profile Info Card overlay */}
      <div className={`max-w-4xl mx-auto px-4 relative z-10 ${hideCover ? 'mt-4' : '-mt-20'}`}>
        <div className={`rounded-3xl border p-5 sm:p-6 transition-all duration-300 ${chrome.card}`}>
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Logo overlay */}
            <div className={`w-24 h-24 rounded-2xl bg-white border border-slate-200 shadow-md overflow-hidden shrink-0 ${hideCover ? '' : '-mt-16 sm:-mt-12'}`}>
              {restaurant.logoUrl ? (
                <img src={restaurant.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-405">
                  <Utensils className="w-8 h-8" />
                </div>
              )}
            </div>

            <div className="space-y-1 text-center sm:text-left">
              <h1 className={`text-2xl tracking-tight leading-tight wrap-anywhere ${chrome.title}`}>{restaurant.name}</h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded text-[10px] font-black border uppercase tracking-wider ${chrome.menuChip}`}>
                  {menu.name}
                </span>
                {menu.description && (
                  <span className={`text-xs truncate max-w-[200px] ${chrome.modalMuted}`} title={menu.description}>
                    • {menu.description}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Table Diners Indicator */}
          {tableNumber && (
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100 shrink-0">
              <Compass className="w-4 h-4 animate-spin-slow" />
              Dining at {formatTableLabel(tableNumber)}
            </div>
          )}
          </div>
          <MenuPlaceDetails
            phone={restaurant.phone}
            whatsapp={restaurant.whatsapp}
            email={restaurant.email}
            website={restaurant.website}
            instagram={restaurant.instagram}
            hours={restaurant.showOpeningHours ? restaurant.openingHours : null}
            muted={chrome.modalMuted}
          />
        </div>
      </div>

      {/* Sticky Filters & Search */}
      <div className={`sticky top-0 z-30 mt-6 overflow-visible border-b backdrop-blur-md transition-all duration-300 ${chrome.sticky}`}>
        <div className="relative mx-auto max-w-4xl space-y-2.5 overflow-visible px-4 py-3">
          {/* Search + language */}
          <div className="flex items-stretch gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                inputMode="search"
                enterKeyHint="search"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                placeholder={t('searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape' && search) {
                    e.preventDefault();
                    setSearch('');
                  }
                }}
                className={`h-11 w-full min-w-0 rounded-2xl border py-0 pl-10 text-sm font-sans transition-all focus:outline-none focus:ring-2 ${
                  search.trim() ? 'pr-10' : 'pr-3'
                } ${chrome.input} [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden`}
              />
              {search.trim() ? (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label={t('clearSearch')}
                  title={t('clearSearch')}
                  className="absolute right-1.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-black/5 hover:text-slate-700 active:scale-95"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              ) : null}
            </div>
            {locales.length > 1 ? (
              <div ref={langRef} className="relative z-10 shrink-0">
                <button
                  type="button"
                  id="menu-locale"
                  aria-haspopup="listbox"
                  aria-expanded={langOpen}
                  aria-label={t('language')}
                  title={t('language')}
                  onClick={() => setLangOpen((open) => !open)}
                  className={`inline-flex h-11 items-center gap-1.5 rounded-2xl border px-2.5 transition active:scale-[0.98] ${chrome.input}`}
                >
                  <Languages className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                  <span className="text-[11px] font-bold uppercase tracking-wide sm:text-xs">
                    {locale.toUpperCase()}
                  </span>
                  <ChevronDown
                    className={`h-3 w-3 shrink-0 opacity-50 transition-transform ${langOpen ? 'rotate-180' : ''}`}
                    aria-hidden
                  />
                </button>
                {langOpen && typeof document !== 'undefined'
                  ? createPortal(
                      <ul
                        ref={langMenuRef}
                        role="listbox"
                        aria-labelledby="menu-locale"
                        style={langMenuStyle}
                        className={`overflow-y-auto overscroll-contain rounded-2xl border py-1 shadow-2xl ${chrome.modal}`}
                      >
                        {locales.map((option) => {
                          const selected = option.code === locale;
                          return (
                            <li key={option.code} role="option" aria-selected={selected}>
                              <button
                                type="button"
                                onClick={() => {
                                  setLocale(option.code);
                                  setLangOpen(false);
                                }}
                                className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition ${
                                  selected
                                    ? 'bg-black/[0.07] font-bold opacity-100'
                                    : 'font-medium opacity-75 hover:bg-black/[0.04] hover:opacity-100'
                                }`}
                              >
                                <span className="min-w-0 flex-1 truncate">
                                  {option.nativeLabel || option.label}
                                </span>
                                <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider opacity-55">
                                  {option.code}
                                </span>
                                {selected ? (
                                  <Check className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
                                ) : (
                                  <span className="h-3.5 w-3.5 shrink-0" aria-hidden />
                                )}
                              </button>
                            </li>
                          );
                        })}
                      </ul>,
                      document.body,
                    )
                  : null}
              </div>
            ) : null}
          </div>

          {/* Diet segmented control — full width so labels never clip */}
          <div
            className={`flex w-full items-center rounded-full border p-0.5 ${chrome.input}`}
            role="group"
            aria-label="Diet filter"
          >
            {(
              [
                { id: 'ALL' as const, label: t('filterAll'), mark: null },
                { id: 'VEG' as const, label: t('filterVeg'), mark: 'veg' as const },
                { id: 'NON_VEG' as const, label: t('filterNonVeg'), mark: 'nonveg' as const },
              ]
            ).map((opt) => {
              const on = dietFilter === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setDietFilter(opt.id)}
                  className={`inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-2 text-[12px] font-bold transition active:scale-[0.98] ${
                    on
                      ? chrome.dietPill(opt.id, true)
                      : 'border-transparent bg-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  {opt.mark === 'veg' ? (
                    <span
                      className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border border-emerald-600 bg-white"
                      aria-hidden
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                    </span>
                  ) : null}
                  {opt.mark === 'nonveg' ? (
                    <span
                      className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border border-red-600 bg-white"
                      aria-hidden
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                    </span>
                  ) : null}
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Bestsellers + categories */}
          <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => setPopularFilter(!popularFilter)}
              className={`inline-flex h-8 shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-3 text-[11px] font-bold transition active:scale-[0.98] sm:text-xs ${
                chrome.popularPill(popularFilter)
              }`}
            >
              <Sparkles className="h-3 w-3" aria-hidden />
              {t('filterBestsellers')}
            </button>

            {filteredCategories.length > 0 ? (
              <>
                <span className="h-4 w-px shrink-0 bg-current opacity-15" aria-hidden />
                {filteredCategories.map((cat) => {
                  const active = activeCategoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryClick(cat.id)}
                      className={`inline-flex h-8 shrink-0 items-center whitespace-nowrap rounded-full border px-3.5 text-[11px] font-bold transition active:scale-[0.98] sm:text-xs ${
                        chrome.catPill(active)
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* Categories & Items Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {!search.trim() ? (
          <div className="mb-8 space-y-4">
            <OfferRail
              offers={offers}
              theme={theme}
              currencySymbol={currencySymbol}
              orderingEnabled={orderingEnabled}
              onJumpToItem={jumpToOfferItem}
            />
            <CollectionStrip
              offers={offers}
              theme={theme}
              currencySymbol={currencySymbol}
              onJumpToItem={jumpToOfferItem}
            />
          </div>
        ) : null}
        {filteredCategories.length === 0 ? (
          <div className={`text-center py-20 border rounded-3xl p-8 ${chrome.empty}`}>
            <Utensils className="w-12 h-12 text-slate-300 mx-auto mb-4 animate-pulse" />
            <h3 className="font-bold text-lg mb-1">{t('emptyTitle')}</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">{t('emptyBody')}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {theme === 'minimal' && renderMinimal()}
            {theme === 'premium' && renderPremium()}
            {theme === 'cafe' && renderCafe()}
            {(theme === 'modern' || !isMenuTheme(theme)) && renderModern()}
            {theme === 'gourmet' && renderGourmet()}
            {theme === 'street' && renderStreet()}
            {theme === 'editorial' && (
              <EditorialTheme categories={filteredCategories} currencySymbol={currencySymbol} onSelectItem={setSelectedItem} offers={offers} />
            )}
            {theme === 'ticket' && (
              <TicketTheme categories={filteredCategories} currencySymbol={currencySymbol} onSelectItem={setSelectedItem} offers={offers} />
            )}
            {theme === 'neon' && (
              <NeonTheme categories={filteredCategories} currencySymbol={currencySymbol} onSelectItem={setSelectedItem} offers={offers} />
            )}
            {theme === 'thali' && (
              <ThaliTheme categories={filteredCategories} currencySymbol={currencySymbol} onSelectItem={setSelectedItem} offers={offers} />
            )}
            {theme === 'garden' && (
              <GardenTheme categories={filteredCategories} currencySymbol={currencySymbol} onSelectItem={setSelectedItem} offers={offers} />
            )}
            {theme === 'polaroid' && (
              <PolaroidTheme categories={filteredCategories} currencySymbol={currencySymbol} onSelectItem={setSelectedItem} offers={offers} />
            )}
            {theme === 'board' && (
              <BoardTheme categories={filteredCategories} currencySymbol={currencySymbol} onSelectItem={setSelectedItem} offers={offers} />
            )}
            {theme === 'lantern' && (
              <LanternTheme categories={filteredCategories} currencySymbol={currencySymbol} onSelectItem={setSelectedItem} offers={offers} />
            )}
            {theme === 'stamp' && (
              <StampTheme categories={filteredCategories} currencySymbol={currencySymbol} onSelectItem={setSelectedItem} offers={offers} />
            )}
            {theme === 'bento' && (
              <BentoTheme categories={filteredCategories} currencySymbol={currencySymbol} onSelectItem={setSelectedItem} offers={offers} />
            )}
            {theme === 'playbill' && (
              <PlaybillTheme categories={filteredCategories} currencySymbol={currencySymbol} onSelectItem={setSelectedItem} offers={offers} />
            )}
          </div>
        )}
      </main>

      {/* Tax & Footer Details */}
      <footer className={`border-t py-12 mt-16 text-center text-xs space-y-2 transition-all duration-300 ${chrome.footer}`}>
        <p className="font-black uppercase tracking-widest text-[10px]">
          {restaurant.name}
        </p>
        <p>Currently viewing: {menu.name}</p>
        {taxRate > 0 && (
          <p>Subject to local taxes: {restaurant.taxName} of {taxRate}% included or added at checkout.</p>
        )}
        {tableNumber && <p className="font-bold">Dining Location: Table {tableNumber}</p>}
        <p className="pt-4 text-slate-350">Powered by QR Junction Menu Suite</p>
      </footer>

      {/* Dish Expanded Dialog Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fade-in" onClick={() => setSelectedItem(null)}>
          <div 
            className={`rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-scale-up relative max-h-[90vh] flex flex-col transition-all duration-300 ${chrome.modal}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-10 text-white rounded-full p-2 transition-all cursor-pointer border-none shadow-sm bg-black/50 hover:bg-black/70"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Dish Image */}
            {selectedItem.image ? (
              <div className="relative h-44 w-full shrink-0 overflow-hidden bg-slate-100 sm:h-64">
                <img src={selectedItem.image} alt={selectedItem.name} className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className={`h-20 w-full flex items-center justify-center shrink-0 border-b sm:h-28 ${chrome.empty}`}>
                <Utensils className="w-10 h-10" />
              </div>
            )}

            {/* Content info */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 scrollbar-none">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  {selectedItem.isVeg && (
                    <span className="w-4.5 h-4.5 rounded border border-emerald-500 flex items-center justify-center shrink-0">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    </span>
                  )}
                  {selectedItem.isNonVeg && (
                    <span className="w-4.5 h-4.5 rounded border border-red-500 flex items-center justify-center shrink-0">
                      <span className="w-2.5 h-2.5 bg-red-500 rotate-45 transform" />
                    </span>
                  )}
                  <h3 className={`text-xl font-bold tracking-tight wrap-anywhere ${chrome.title}`}>{selectedItem.name}</h3>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  {selectedItem.variants && selectedItem.variants.length > 0 ? (
                    orderingEnabled ? (
                      <span className={`text-sm font-semibold ${chrome.modalMuted}`}>
                        From {currencySymbol}
                        {Math.min(...selectedItem.variants.map((v: any) => Number(v.price))).toFixed(0)}
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {selectedItem.variants.map((v: any, vi: number) => (
                          <div key={vi} className={`flex flex-col items-center border rounded-xl px-3 py-2 min-w-[75px] ${chrome.empty}`}>
                            <span className={`text-[9px] font-semibold uppercase tracking-wider ${chrome.modalMuted}`}>{v.label}</span>
                            <span className="text-base font-black">{currencySymbol}{Number(v.price).toFixed(0)}</span>
                          </div>
                        ))}
                      </div>
                    )
                  ) : (
                    <span className="text-lg font-black">
                      <ItemPrice item={selectedItem} symbol={currencySymbol} />
                    </span>
                  )}
                  {selectedItem.isPopular && (
                    <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold border border-amber-100 shrink-0">
                      <Sparkles className="w-3 h-3 fill-amber-500" /> Bestseller
                    </span>
                  )}
                </div>
                <ItemTags item={selectedItem} hidePopular size="md" className="mt-2" />
              </div>

              {selectedItem.description && (
                <div className="space-y-1.5 border-t border-current/10 pt-4">
                  <h5 className={`text-xs font-bold uppercase tracking-wider ${chrome.modalMuted}`}>{t('dishDescription')}</h5>
                  <p className="text-sm leading-relaxed font-sans">{selectedItem.description}</p>
                </div>
              )}
              <DishOrderActions
                item={selectedItem}
                variantLabel={selectedVariant}
                onVariant={setSelectedVariant}
                currencySymbol={currencySymbol}
              />
            </div>
          </div>
        </div>
      )}
    </div>
    </OfferProvider>
    </PlateProvider>
  );
}
