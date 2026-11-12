export const TTL = {
  profile: 10 * 60,
  settings: 10 * 60,
  tables: 10 * 60,
  menusIndex: 10 * 60,
  menuTree: 10 * 60,
  entitlements: 10 * 60,
  activeOrders: 30,
  overview: 60,
} as const;

export type RestaurantCacheTag =
  | "profile"
  | "settings"
  | "tables"
  | "menus:index"
  | "menu"
  | "entitlements"
  | "orders:active"
  | "overview";

export function restaurantCacheKey(restaurantId: number, tag: string) {
  return `rest:${restaurantId}:${tag}`;
}

export function menuTreeCacheKey(restaurantId: number, menuId: number) {
  return restaurantCacheKey(restaurantId, `menu:${menuId}`);
}

export function userEntitlementsKey(userId: number) {
  return `user:${userId}:entitlements`;
}
