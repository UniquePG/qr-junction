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
  stats?: boolean;
  userId?: number;
};

export async function invalidateRestaurant(restaurantId: number, opts: InvalidateOpts = {}) {
  const keys: string[] = [];
  if (opts.profile) keys.push(restaurantCacheKey(restaurantId, "profile"));
  if (opts.settings) keys.push(restaurantCacheKey(restaurantId, "settings"));
  if (opts.tables) keys.push(restaurantCacheKey(restaurantId, "tables"));
  if (opts.menusIndex) keys.push(restaurantCacheKey(restaurantId, "menus:index"));
  if (opts.ordersActive) keys.push(restaurantCacheKey(restaurantId, "orders:active"));
  if (typeof opts.menu === "number") keys.push(menuTreeCacheKey(restaurantId, opts.menu));
  if (opts.userId && opts.entitlements) keys.push(userEntitlementsKey(opts.userId));

  if (keys.length) await cacheDel(...keys);

  const patterns: string[] = [];
  if (opts.overview) {
    patterns.push(restaurantCacheKey(restaurantId, "overview"));
    patterns.push(restaurantCacheKey(restaurantId, "overview:*"));
  }
  if (opts.stats || opts.overview) {
    patterns.push(restaurantCacheKey(restaurantId, "stats:*"));
  }
  if (opts.menu === "all") {
    patterns.push(restaurantCacheKey(restaurantId, "menu:*"));
  }
  await Promise.all(patterns.map((pattern) => cacheDelPattern(pattern)));
}

export async function invalidateActiveOrdersCache(restaurantId: number) {
  await cacheDel(restaurantCacheKey(restaurantId, "orders:active"));
}
