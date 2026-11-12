import { redisEnabled, redisPublish, redisSubscribe } from "@/lib/cache/redis";

type Listener = (event: OrderBusEvent) => void;

export type OrderBusEvent = {
  id: string;
  type: "order.placed" | "order.updated";
  order: Record<string, unknown>;
  placedCount?: number;
};

type GlobalBus = {
  listeners: Map<string, Set<Listener>>;
  seq: number;
  redisWired: Set<string>;
  origin: string;
};

const globalBus = globalThis as typeof globalThis & { __qrOrderBus?: GlobalBus };

function bus(): GlobalBus {
  if (!globalBus.__qrOrderBus) {
    globalBus.__qrOrderBus = {
      listeners: new Map(),
      seq: 0,
      redisWired: new Set(),
      origin: `pid-${process.pid}-${Math.random().toString(36).slice(2, 8)}`,
    };
  }
  return globalBus.__qrOrderBus;
}

function deliverLocal(channel: string, payload: OrderBusEvent) {
  const listeners = bus().listeners.get(channel);
  if (!listeners) return;
  for (const listener of listeners) {
    try {
      listener(payload);
    } catch {
      // A closed stream must not stop the others.
    }
  }
}

function ensureRedisBridge(channel: string) {
  const state = bus();
  if (!redisEnabled() || state.redisWired.has(channel)) return;
  state.redisWired.add(channel);
  redisSubscribe(channel, (_ch, message) => {
    try {
      const payload = JSON.parse(message) as OrderBusEvent & { origin?: string };
      if (!payload?.id || !payload?.type) return;
      // Skip echoes of events this process already delivered locally.
      if (payload.origin && payload.origin === bus().origin) return;
      deliverLocal(channel, payload);
    } catch {
      // ignore malformed
    }
  });
}

export function publishOrder(channel: string, event: Omit<OrderBusEvent, "id">) {
  const state = bus();
  state.seq += 1;
  const payload: OrderBusEvent & { origin: string } = {
    ...event,
    id: `local-${state.seq}`,
    origin: state.origin,
  };
  deliverLocal(channel, payload);
  // Fan-out to other Node processes when Redis is configured.
  void redisPublish(channel, JSON.stringify(payload));
  return payload;
}

export function subscribeOrder(channel: string, listener: Listener) {
  const state = bus();
  const set = state.listeners.get(channel) ?? new Set<Listener>();
  set.add(listener);
  state.listeners.set(channel, set);
  ensureRedisBridge(channel);
  return () => {
    set.delete(listener);
    if (set.size === 0) state.listeners.delete(channel);
  };
}

export function restaurantChannel(restaurantId: number) {
  return `restaurant:${restaurantId}`;
}

export function orderChannel(publicToken: string) {
  return `order:${publicToken}`;
}
