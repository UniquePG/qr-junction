import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { previewItemDiscountPrice } from "./pricing";
import { parsePresentation, parseSchedule } from "./rules";
import { isOfferInSchedule, isOfferWithinDateRange } from "./schedule";
import type { OfferForPricing } from "./pricing";
import type {
  CollectionRules,
  GuestOfferDto,
  GuestOfferView,
  GuestItemOffer,
  ItemDiscountRules,
  MenuOfferType,
  SpecialRules,
} from "./types";

export type { OfferForPricing } from "./pricing";

type OfferRow = {
  id: number;
  type: MenuOfferType;
  title: string;
  subtitle: string | null;
  badgeLabel: string | null;
  imageUrl: string | null;
  priority: number;
  startsAt: Date | null;
  endsAt: Date | null;
  schedule: Prisma.JsonValue | null;
  rules: Prisma.JsonValue;
  presentation: Prisma.JsonValue | null;
  menuId: number | null;
  targets: { kind: "ITEM" | "CATEGORY"; refId: number }[];
};

function toDto(row: OfferRow, itemIds: number[], categoryIds: number[]): GuestOfferDto {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    subtitle: row.subtitle,
    badgeLabel: row.badgeLabel,
    imageUrl: row.imageUrl,
    priority: row.priority,
    presentation: parsePresentation(row.presentation),
    rules: row.rules as GuestOfferDto["rules"],
    itemIds,
    categoryIds,
  };
}

function expandItemIds(
  targets: OfferRow["targets"],
  categoryItemMap: Map<number, number[]>,
  rules: unknown,
  type: MenuOfferType,
): { itemIds: number[]; categoryIds: number[] } {
  const categoryIds = targets.filter((t) => t.kind === "CATEGORY").map((t) => t.refId);
  const itemIds = new Set(targets.filter((t) => t.kind === "ITEM").map((t) => t.refId));
  for (const catId of categoryIds) {
    for (const id of categoryItemMap.get(catId) || []) itemIds.add(id);
  }
  if (type === "COMBO" && rules && typeof rules === "object") {
    const slots = (rules as { slots?: { itemIds?: number[] }[] }).slots;
    if (Array.isArray(slots)) {
      for (const slot of slots) {
        for (const id of slot.itemIds || []) itemIds.add(id);
      }
    }
  }
  if (type === "SPECIAL") {
    const ids = (rules as SpecialRules)?.highlightItemIds;
    if (Array.isArray(ids)) for (const id of ids) itemIds.add(id);
  }
  return { itemIds: [...itemIds], categoryIds };
}

export async function loadRestaurantOffers(restaurantId: number, menuId?: number | null) {
  return prisma.menuOffer.findMany({
    where: {
      restaurantId,
      status: "ACTIVE",
      OR: menuId != null ? [{ menuId: null }, { menuId }] : undefined,
    },
    include: {
      targets: { select: { kind: true, refId: true } },
    },
    orderBy: [{ priority: "desc" }, { id: "desc" }],
  });
}

export function filterLiveOffers<T extends OfferRow>(rows: T[], at = new Date()): T[] {
  return rows.filter((row) => {
    if (!isOfferWithinDateRange(row.startsAt, row.endsAt, at)) return false;
    return isOfferInSchedule(parseSchedule(row.schedule), at);
  });
}

export function buildGuestOfferView(
  rows: OfferRow[],
  menuItems: { id: number; categoryId: number; price: number }[],
  at = new Date(),
): GuestOfferView {
  const live = filterLiveOffers(rows, at);
  const categoryItemMap = new Map<number, number[]>();
  for (const item of menuItems) {
    const list = categoryItemMap.get(item.categoryId) || [];
    list.push(item.id);
    categoryItemMap.set(item.categoryId, list);
  }
  const priceById = new Map(menuItems.map((i) => [i.id, i.price]));

  const dtos: GuestOfferDto[] = [];
  const itemOffers: Record<string, GuestItemOffer> = {};

  for (const row of live) {
    const { itemIds, categoryIds } = expandItemIds(row.targets, categoryItemMap, row.rules, row.type);
    let resolvedItemIds = itemIds;

    if (row.type === "COLLECTION") {
      const rules = row.rules as CollectionRules;
      if (rules?.mode === "under_price" && rules.maxPrice != null) {
        resolvedItemIds = menuItems.filter((i) => i.price <= rules.maxPrice!).map((i) => i.id);
      }
    }

    let dto = toDto(row, resolvedItemIds, categoryIds);
    if (
      row.type === "BOGO" &&
      resolvedItemIds.length > 1 &&
      dto.rules &&
      typeof dto.rules === "object"
    ) {
      const r = dto.rules as { sameItem?: boolean; sameItemStrict?: boolean };
      if (r.sameItem === true && !r.sameItemStrict) {
        dto = { ...dto, rules: { ...r, sameItem: false } as GuestOfferDto["rules"] };
      }
    }
    dtos.push(dto);

    const badge =
      row.badgeLabel?.trim() ||
      (row.type === "BOGO"
        ? "BOGO"
        : row.type === "COMBO"
          ? "Combo"
          : row.type === "COLLECTION"
            ? "Under"
            : row.type === "SPECIAL"
              ? "Special"
              : "Offer");

    if (row.type === "ITEM_DISCOUNT") {
      const rules = row.rules as ItemDiscountRules;
      for (const itemId of resolvedItemIds) {
        const key = String(itemId);
        const existing = itemOffers[key];
        const list = priceById.get(itemId);
        const offerUnit =
          list != null ? previewItemDiscountPrice(list, rules) : null;
        // Higher-priority ITEM_DISCOUNT already won.
        if (existing?.type === "ITEM_DISCOUNT") continue;
        if (existing) {
          // Keep COMBO/BOGO/etc badge, but still attach strike price for guests.
          if (existing.offerUnitPrice == null && offerUnit != null) {
            itemOffers[key] = {
              ...existing,
              listUnitPrice: list ?? existing.listUnitPrice ?? null,
              offerUnitPrice: offerUnit,
            };
          }
          continue;
        }
        itemOffers[key] = {
          offerId: row.id,
          type: row.type,
          badgeLabel: badge,
          title: row.title,
          listUnitPrice: list ?? null,
          offerUnitPrice: offerUnit,
        };
      }
    } else if (row.type === "BOGO" || row.type === "SPECIAL" || row.type === "COMBO") {
      for (const itemId of resolvedItemIds) {
        const key = String(itemId);
        const existing = itemOffers[key];
        if (existing) {
          // Prefer a more specific badge than a plain collection/under tag.
          if (existing.type === "COLLECTION") {
            itemOffers[key] = {
              ...existing,
              offerId: row.id,
              type: row.type,
              badgeLabel: badge,
              title: row.title,
            };
          }
          continue;
        }
        itemOffers[key] = {
          offerId: row.id,
          type: row.type,
          badgeLabel: badge,
          title: row.title,
        };
      }
    } else if (row.type === "COLLECTION") {
      for (const itemId of resolvedItemIds) {
        const key = String(itemId);
        if (itemOffers[key]) continue;
        itemOffers[key] = {
          offerId: row.id,
          type: row.type,
          badgeLabel: badge,
          title: row.title,
        };
      }
    }
  }

  const heroes = dtos.filter(
    (o) =>
      o.type === "SPECIAL" ||
      o.presentation?.emphasis === "hero" ||
      o.type === "COMBO",
  );
  const collections = dtos.filter((o) => o.type === "COLLECTION");
  // Collections render in CollectionStrip — keep them out of the promo rail.
  const rail = dtos.filter(
    (o) =>
      o.presentation?.emphasis !== "badge" &&
      (o.type === "ITEM_DISCOUNT" ||
        o.type === "BOGO" ||
        o.type === "COMBO" ||
        o.type === "SPECIAL"),
  );

  return { rail, heroes, collections, itemOffers };
}

export async function resolveGuestOffers(input: {
  restaurantId: number;
  menuId: number;
  items: { id: number; categoryId: number; price: number }[];
}): Promise<GuestOfferView> {
  const rows = (await loadRestaurantOffers(input.restaurantId, input.menuId)) as OfferRow[];
  return buildGuestOfferView(rows, input.items);
}

export function toPricingOffers(rows: OfferRow[]): OfferForPricing[] {
  const live = filterLiveOffers(rows);
  return live
    .filter((r) => r.type === "ITEM_DISCOUNT" || r.type === "BOGO" || r.type === "COMBO")
    .map((row) => {
      const itemIds = row.targets.filter((t) => t.kind === "ITEM").map((t) => t.refId);
      if (row.type === "COMBO" && row.rules && typeof row.rules === "object") {
        const slots = (row.rules as { slots?: { itemIds?: number[] }[] }).slots;
        if (Array.isArray(slots)) {
          for (const slot of slots) {
            for (const id of slot.itemIds || []) {
              if (!itemIds.includes(id)) itemIds.push(id);
            }
          }
        }
      }
      let rules = row.rules;
      // Legacy wizard always wrote sameItem:true for multi-dish pools.
      // Heal those to mix & match unless the owner saved with sameItemStrict.
      if (row.type === "BOGO" && itemIds.length > 1 && rules && typeof rules === "object") {
        const r = rules as { sameItem?: boolean; sameItemStrict?: boolean };
        if (r.sameItem === true && !r.sameItemStrict) {
          rules = { ...r, sameItem: false };
        }
      }
      return {
        id: row.id,
        type: row.type,
        title: row.title,
        priority: row.priority,
        itemIds,
        rules,
      };
    });
}

export async function loadPricingOffers(restaurantId: number, menuId: number) {
  const rows = (await loadRestaurantOffers(restaurantId, menuId)) as OfferRow[];
  // Expand CATEGORY targets for pricing
  const catIds = [
    ...new Set(
      rows.flatMap((r) => r.targets.filter((t) => t.kind === "CATEGORY").map((t) => t.refId)),
    ),
  ];
  let catItems: { id: number; categoryId: number }[] = [];
  if (catIds.length) {
    catItems = await prisma.menuItem.findMany({
      where: { categoryId: { in: catIds }, category: { restaurantId, menuId } },
      select: { id: true, categoryId: true },
    });
  }
  const byCat = new Map<number, number[]>();
  for (const item of catItems) {
    const list = byCat.get(item.categoryId) || [];
    list.push(item.id);
    byCat.set(item.categoryId, list);
  }
  const expanded = rows.map((row) => {
    const itemIds = new Set(row.targets.filter((t) => t.kind === "ITEM").map((t) => t.refId));
    for (const t of row.targets) {
      if (t.kind === "CATEGORY") {
        for (const id of byCat.get(t.refId) || []) itemIds.add(id);
      }
    }
    return {
      ...row,
      targets: [...itemIds].map((refId) => ({ kind: "ITEM" as const, refId })),
    };
  });
  return toPricingOffers(expanded);
}
