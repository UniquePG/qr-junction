import type { MenuLocaleCode } from "./locales";

export type MenuI18nFields = {
  name?: string;
  description?: string;
  variants?: Array<{ label: string }>;
};

export type EntityI18nMap = Partial<Record<MenuLocaleCode, MenuI18nFields>>;

export type RestaurantI18nFields = {
  name?: string;
  description?: string;
};

export type RestaurantI18nMap = Partial<Record<MenuLocaleCode, RestaurantI18nFields>>;

export type ItemVariant = {
  label: string;
  price: number;
};

export function asI18nMap(value: unknown): EntityI18nMap {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as EntityI18nMap;
}

export function asRestaurantI18nMap(value: unknown): RestaurantI18nMap {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as RestaurantI18nMap;
}

export function readVariants(value: unknown): ItemVariant[] {
  if (!Array.isArray(value)) return [];
  const out: ItemVariant[] = [];
  for (const row of value) {
    if (!row || typeof row !== "object") continue;
    const label = typeof (row as { label?: unknown }).label === "string"
      ? (row as { label: string }).label.trim()
      : "";
    const priceRaw = (row as { price?: unknown }).price;
    const price = typeof priceRaw === "number" ? priceRaw : Number(priceRaw);
    if (!label || !Number.isFinite(price)) continue;
    out.push({ label, price });
  }
  return out;
}
