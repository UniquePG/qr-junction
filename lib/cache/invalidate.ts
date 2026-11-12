import { cacheDel, cacheDelPattern } from "@/lib/cache/redis";
import { menuTreeCacheKey, restaurantCacheKey, userEntitlementsKey } from "@/lib/cache/keys";

export type InvalidateOpts = {
  profile?: boolean;
  settings?: boolean;
  tables?: boolean;
  menusIndex?: boolean;
  /** Invalidate one menu tree, or all menus when `"all"`. */
  menu?: number | "all";
  entitlements?: boolean;
  ordersActive?: boolean;
  overview?: boolean;
  userId?: number;
};

export async function invalidateRestaurant(restaurantId: number, opts: InvalidateOpts = {}) {
  const keys: string[] = [];
  if (opts.profile) keys.push(restaurantCacheKey(restaurantId, "profile"));
  if (opts.settings) keys.push(restaurantCacheKey(restaurantId, "settings"));
  if (opts.tables) keys.push(restaurantCacheKey(restaurantId, "tables"));
  if (opts.menusIndex) keys.push(restaurantCacheKey(restaurantId, "menus:index"));
  if (opts.ordersActive) keys.push(restaurantCacheKey(restaurantId, "orders:active"));
  if (opts.overview) keys.push(restaurantCacheKey(restaurantId, "overview"));
  if (typeof opts.menu === "number") keys.push(menuTreeCacheKey(restaurantId, opts.menu));
  if (opts.userId && opts.entitlements) keys.push(userEntitlementsKey(opts.userId));

  if (keys.length) await cacheDel(...keys);
  if (opts.menu === "all") {
    await cacheDelPattern(restaurantCacheKey(restaurantId, "menu:*"));
  }
}

export async function invalidateActiveOrdersCache(restaurantId: number) {
  await cacheDel(restaurantCacheKey(restaurantId, "orders:active"));
}
