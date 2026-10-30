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
};

const globalBus = globalThis as typeof globalThis & { __qrOrderBus?: GlobalBus };

function bus(): GlobalBus {
  if (!globalBus.__qrOrderBus) {
    globalBus.__qrOrderBus = { listeners: new Map(), seq: 0 };
  }
  return globalBus.__qrOrderBus;
}

export function publishOrder(channel: string, event: Omit<OrderBusEvent, "id">) {
  const state = bus();
  state.seq += 1;
  const payload: OrderBusEvent = { ...event, id: String(state.seq) };
  const listeners = state.listeners.get(channel);
  if (!listeners) return payload;
  for (const listener of listeners) {
    try {
      listener(payload);
    } catch {
      // A closed stream must not stop the others.
    }
  }
  return payload;
}

export function subscribeOrder(channel: string, listener: Listener) {
  const state = bus();
  const set = state.listeners.get(channel) ?? new Set<Listener>();
  set.add(listener);
  state.listeners.set(channel, set);
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
