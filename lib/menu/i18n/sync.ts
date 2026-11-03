import { prisma } from "@/lib/prisma";
import {
  DEFAULT_MENU_LOCALE,
  isTranslatableLocale,
  type MenuLocaleCode,
} from "./locales";
import { translateMany, translateText } from "./sarvamTranslate";
import { mergeEntityI18n } from "./resolve";
import { readVariants } from "./types";

async function getActiveTargetLocales(restaurantId: number): Promise<MenuLocaleCode[]> {
  const rows = await prisma.restaurantLocale.findMany({
    where: {
      restaurantId,
      active: true,
      status: "ready",
      NOT: { code: DEFAULT_MENU_LOCALE },
    },
    select: { code: true },
  });
  return rows
    .map((row) => row.code as MenuLocaleCode)
    .filter((code) => isTranslatableLocale(code));
}

export async function ensureEnglishLocale(restaurantId: number) {
  await prisma.restaurantLocale.upsert({
    where: {
      restaurantId_code: { restaurantId, code: DEFAULT_MENU_LOCALE },
    },
    create: {
      restaurantId,
      code: DEFAULT_MENU_LOCALE,
      active: true,
      status: "ready",
      lastTranslatedAt: new Date(),
    },
    update: {
      active: true,
      status: "ready",
    },
  });
}

async function translateCategory(
  categoryId: number,
  locale: MenuLocaleCode,
) {
  const category = await prisma.menuCategory.findUnique({
    where: { id: categoryId },
    select: { id: true, name: true, i18n: true },
  });
  if (!category) return;

  const name = await translateText(category.name, locale);
  await prisma.menuCategory.update({
    where: { id: category.id },
    data: { i18n: mergeEntityI18n(category.i18n, locale, { name }) },
  });
}

async function translateItem(
  itemId: number,
  locale: MenuLocaleCode,
) {
  const item = await prisma.menuItem.findUnique({
    where: { id: itemId },
    select: { id: true, name: true, description: true, variants: true, i18n: true },
  });
  if (!item) return;

  const name = await translateText(item.name, locale);
  const description = item.description?.trim()
    ? await translateText(item.description, locale)
    : undefined;

  const variants = readVariants(item.variants);
  let variantLabels: Array<{ label: string }> | undefined;
  if (variants.length) {
    const labels = await translateMany(
      variants.map((v) => v.label),
      locale,
    );
    variantLabels = labels.map((label, index) => ({
      label: label || variants[index].label,
    }));
  }

  await prisma.menuItem.update({
    where: { id: item.id },
    data: {
      i18n: mergeEntityI18n(item.i18n, locale, {
        name,
        ...(description !== undefined ? { description } : {}),
        ...(variantLabels ? { variants: variantLabels } : {}),
      }),
    },
  });
}

/** Full restaurant batch for one locale (enable / retry). */
export async function translateRestaurantToLocale(
  restaurantId: number,
  locale: MenuLocaleCode,
): Promise<void> {
  if (!isTranslatableLocale(locale)) return;

  await prisma.restaurantLocale.update({
    where: { restaurantId_code: { restaurantId, code: locale } },
    data: { status: "pending", lastError: null },
  });

  try {
    // Restaurant brand + menu title/description stay English in the guest header/footer.
    // Only categories and items are translated for the menu body.

    const categories = await prisma.menuCategory.findMany({
      where: { restaurantId },
      select: { id: true },
      orderBy: { id: "asc" },
    });
    for (const category of categories) {
      await translateCategory(category.id, locale);
    }

    const items = await prisma.menuItem.findMany({
      where: { category: { restaurantId } },
      select: { id: true },
      orderBy: { id: "asc" },
    });
    for (const item of items) {
      await translateItem(item.id, locale);
    }

    await prisma.restaurantLocale.update({
      where: { restaurantId_code: { restaurantId, code: locale } },
      data: {
        status: "ready",
        active: true,
        lastError: null,
        lastTranslatedAt: new Date(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await prisma.restaurantLocale.update({
      where: { restaurantId_code: { restaurantId, code: locale } },
      data: {
        status: "failed",
        lastError: message.slice(0, 2000),
      },
    });
    throw error;
  }
}

export async function syncItemTranslations(
  restaurantId: number,
  itemId: number,
  opts?: { locales?: MenuLocaleCode[] },
) {
  const locales = opts?.locales ?? (await getActiveTargetLocales(restaurantId));
  for (const locale of locales) {
    await translateItem(itemId, locale);
  }
}

export async function syncCategoryTranslations(
  restaurantId: number,
  categoryId: number,
  opts?: { locales?: MenuLocaleCode[] },
) {
  const locales = opts?.locales ?? (await getActiveTargetLocales(restaurantId));
  for (const locale of locales) {
    await translateCategory(categoryId, locale);
  }
}

/** No-op: menu titles stay English in header/footer. */
export async function syncMenuTranslations(
  _restaurantId: number,
  _menuId: number,
  _opts?: { locales?: MenuLocaleCode[] },
) {
  return;
}

/** No-op: restaurant brand stays English in the guest header. */
export async function syncRestaurantBrandTranslations(
  _restaurantId: number,
  _opts?: { locales?: MenuLocaleCode[] },
) {
  return;
}

/** Fire-and-forget batch; errors are stored on the locale row. */
export function startLocaleTranslationJob(
  restaurantId: number,
  locale: MenuLocaleCode,
) {
  void translateRestaurantToLocale(restaurantId, locale).catch((error) => {
    console.error(`Menu locale translation failed (${restaurantId}/${locale}):`, error);
  });
}

/** Re-run translation for every active non-English locale (e.g. after bulk import). */
export async function retranslateActiveLocales(restaurantId: number) {
  const locales = await prisma.restaurantLocale.findMany({
    where: {
      restaurantId,
      active: true,
      NOT: { code: DEFAULT_MENU_LOCALE },
    },
    select: { code: true },
  });

  for (const row of locales) {
    const code = row.code as MenuLocaleCode;
    if (!isTranslatableLocale(code)) continue;
    startLocaleTranslationJob(restaurantId, code);
  }
}
