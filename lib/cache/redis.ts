import Redis from "ioredis";

type GlobalRedis = {
  client?: Redis | null;
  subscriber?: Redis | null;
  disabled?: boolean;
};

const globalRedis = globalThis as typeof globalThis & { __qrRedis?: GlobalRedis };

function state(): GlobalRedis {
  if (!globalRedis.__qrRedis) globalRedis.__qrRedis = {};
  return globalRedis.__qrRedis;
}

/** Soft cap — skip caching oversized payloads (large multilingual menus). */
export const MAX_CACHE_BYTES = 1.5 * 1024 * 1024;

export function redisEnabled() {
  return Boolean(process.env.REDIS_URL?.trim()) && !state().disabled;
}

export function getRedis(): Redis | null {
  if (!redisEnabled()) return null;
  const bag = state();
  if (bag.client) return bag.client;
  try {
    const client = new Redis(process.env.REDIS_URL!, {
      maxRetriesPerRequest: 1,
      enableReadyCheck: true,
      connectTimeout: 2000,
      retryStrategy: (times) => (times > 3 ? null : Math.min(times * 200, 1000)),
    });
    client.on("error", (error) => {
      console.warn("[redis]", error.message);
    });
    bag.client = client;
    return client;
  } catch (error) {
    console.warn("[redis] init failed", error);
    bag.disabled = true;
    return null;
  }
}

export async function cacheGet(key: string): Promise<string | null> {
  const client = getRedis();
  if (!client) return null;
  try {
    return await client.get(key);
  } catch {
    return null;
  }
}

export async function cacheGetJson<T>(key: string): Promise<T | null> {
  const raw = await cacheGet(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: string, ttlSec: number): Promise<boolean> {
  const client = getRedis();
  if (!client) return false;
  if (Buffer.byteLength(value, "utf8") > MAX_CACHE_BYTES) {
    console.warn(`[redis] skip oversized key ${key}`);
    return false;
  }
  try {
    await client.set(key, value, "EX", Math.max(1, Math.floor(ttlSec)));
    return true;
  } catch {
    return false;
  }
}

export async function cacheSetJson(key: string, value: unknown, ttlSec: number): Promise<boolean> {
  try {
    return await cacheSet(key, JSON.stringify(value), ttlSec);
  } catch {
    return false;
  }
}

export async function cacheDel(...keys: string[]): Promise<void> {
  const client = getRedis();
  if (!client || keys.length === 0) return;
  try {
    await client.del(...keys);
  } catch {
    // ignore
  }
}

export async function cacheDelPattern(pattern: string): Promise<void> {
  const client = getRedis();
  if (!client) return;
  try {
    let cursor = "0";
    do {
      const [next, keys] = await client.scan(cursor, "MATCH", pattern, "COUNT", 50);
      cursor = next;
      if (keys.length) await client.del(...keys);
    } while (cursor !== "0");
  } catch {
    // ignore
  }
}

export async function redisPublish(channel: string, payload: string): Promise<void> {
  const client = getRedis();
  if (!client) return;
  try {
    await client.publish(channel, payload);
  } catch {
    // ignore
  }
}

export function redisSubscribe(
  channel: string,
  onMessage: (channel: string, message: string) => void,
): () => void {
  if (!redisEnabled()) return () => undefined;
  const bag = state();
  try {
    if (!bag.subscriber) {
      bag.subscriber = new Redis(process.env.REDIS_URL!, {
        maxRetriesPerRequest: null,
        connectTimeout: 2000,
        retryStrategy: (times) => (times > 3 ? null : Math.min(times * 200, 1000)),
      });
      bag.subscriber.on("error", (error) => {
        console.warn("[redis:sub]", error.message);
      });
    }
    const sub = bag.subscriber;
    const handler = (ch: string, message: string) => {
      if (ch === channel) onMessage(ch, message);
    };
    sub.on("message", handler);
    void sub.subscribe(channel);
    return () => {
      try {
        sub.off("message", handler);
        void sub.unsubscribe(channel);
      } catch {
        // ignore
      }
    };
  } catch (error) {
    console.warn("[redis] subscribe failed", error);
    return () => undefined;
  }
}
