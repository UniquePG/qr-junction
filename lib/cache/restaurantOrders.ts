import { cacheGetJson, cacheSetJson } from "@/lib/cache/redis";
import { restaurantCacheKey, TTL } from "@/lib/cache/keys";
import { invalidateActiveOrdersCache } from "@/lib/cache/invalidate";

export { invalidateActiveOrdersCache };

export async function getCachedActiveOrders<T>(restaurantId: number): Promise<T | null> {
  return cacheGetJson<T>(restaurantCacheKey(restaurantId, "orders:active"));
}

export async function setCachedActiveOrders(restaurantId: number, payload: unknown): Promise<void> {
  await cacheSetJson(restaurantCacheKey(restaurantId, "orders:active"), payload, TTL.activeOrders);
}
