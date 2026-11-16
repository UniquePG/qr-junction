export const TTL = {
  profile: 10 * 60,
  settings: 10 * 60,
  tables: 10 * 60,
  menusIndex: 10 * 60,
  menuTree: 10 * 60,
  entitlements: 10 * 60,
  activeOrders: 30,
  overview: 60,
  stats: 60,
} as const;

export type RestaurantCacheTag =
  | "profile"
  | "settings"
  | "tables"
  | "menus:index"
  | "menu"
  | "entitlements"
  | "orders:active"
  | "overview"
  | "stats";

export function restaurantCacheKey(restaurantId: number, tag: string) {
  return `rest:${restaurantId}:${tag}`;
}

export function menuTreeCacheKey(restaurantId: number, menuId: number) {
  return restaurantCacheKey(restaurantId, `menu:${menuId}`);
}

export function userEntitlementsKey(userId: number) {
  return `user:${userId}:entitlements`;
}

function rangeStamp(start?: Date | null, end?: Date | null, allTime?: boolean) {
  if (allTime || (!start && !end)) return "all";
  const from = start ? start.toISOString() : "open";
  const to = end ? end.toISOString() : "open";
  return `${from}_${to}`;
}

/** Call only after plan clamp so free plans cannot hit paid all-time keys. */
export function overviewRangeCacheKey(
  restaurantId: number,
  start?: Date | null,
  end?: Date | null,
  allTime?: boolean,
) {
  return restaurantCacheKey(restaurantId, `overview:${rangeStamp(start, end, allTime)}`);
}

export function statsRangeCacheKey(
  restaurantId: number,
  start?: Date | null,
  end?: Date | null,
  allTime?: boolean,
) {
  return restaurantCacheKey(restaurantId, `stats:${rangeStamp(start, end, allTime)}`);
}
