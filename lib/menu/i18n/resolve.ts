import type { MenuLocaleCode } from "./locales";
import {
  asI18nMap,
  asRestaurantI18nMap,
  readVariants,
  type EntityI18nMap,
  type ItemVariant,
  type RestaurantI18nMap,
} from "./types";

export function pickLocalizedName(
  locale: MenuLocaleCode,
  baseName: string,
  i18n: unknown,
): string {
  if (locale === "en") return baseName;
  const map = asI18nMap(i18n);
  const localized = map[locale]?.name?.trim();
  return localized || baseName;
}

export function pickLocalizedDescription(
  locale: MenuLocaleCode,
  baseDescription: string | null | undefined,
  i18n: unknown,
): string | null {
  const base = baseDescription?.trim() || null;
  if (locale === "en") return base;
  const map = asI18nMap(i18n);
  const localized = map[locale]?.description?.trim();
  if (localized) return localized;
  return base;
}

export function pickLocalizedVariants(
  locale: MenuLocaleCode,
  baseVariants: unknown,
  i18n: unknown,
): ItemVariant[] {
  const variants = readVariants(baseVariants);
  if (locale === "en" || !variants.length) return variants;

  const map = asI18nMap(i18n);
  const localized = map[locale]?.variants;
  if (!localized?.length) return variants;

  return variants.map((variant, index) => ({
    ...variant,
    label: localized[index]?.label?.trim() || variant.label,
  }));
}

export function localizeRestaurant(
  locale: MenuLocaleCode,
  restaurant: { name: string; description?: string | null; i18n?: unknown },
) {
  if (locale === "en") {
    return {
      name: restaurant.name,
      description: restaurant.description ?? null,
    };
  }
  const map = asRestaurantI18nMap(restaurant.i18n);
  const entry = map[locale];
  return {
    name: entry?.name?.trim() || restaurant.name,
    description: entry?.description?.trim() || restaurant.description || null,
  };
}

export function mergeEntityI18n(
  existing: unknown,
  locale: MenuLocaleCode,
  patch: { name?: string; description?: string; variants?: Array<{ label: string }> },
): EntityI18nMap {
  const map = { ...asI18nMap(existing) };
  const prev = map[locale] || {};
  map[locale] = {
    ...prev,
    ...patch,
    ...(patch.variants ? { variants: patch.variants } : {}),
  };
  return map;
}

export function mergeRestaurantI18n(
  existing: unknown,
  locale: MenuLocaleCode,
  patch: { name?: string; description?: string },
): RestaurantI18nMap {
  const map = { ...asRestaurantI18nMap(existing) };
  map[locale] = { ...(map[locale] || {}), ...patch };
  return map;
}
