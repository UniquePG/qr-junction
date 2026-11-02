"use client";

export type LiveEvent = {
  type: string;
  id?: string;
  placedCount?: number;
  message?: string;
  order?: {
    publicId?: string;
    publicToken?: string;
    tableNumber?: string | null;
    [key: string]: unknown;
  };
};

type KitchenAuth = {
  role: "kitchen";
  token: () => Promise<string | null>;
};

type GuestAuth = {
  role: "guest";
  tokens: () => string[];
};

export function openLiveSocket(auth: KitchenAuth | GuestAuth, onEvent: (event: LiveEvent) => void) {
  let stopped = false;
  let socket: WebSocket | null = null;
  let delay = 1000;
  let timer = 0;

  const sendAuth = () => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    if (auth.role === "kitchen") {
      void auth.token().then((token) => {
        if (!token || !socket || socket.readyState !== WebSocket.OPEN) return;
        socket.send(JSON.stringify({ type: "auth", token }));
      });
      return;
    }
    socket.send(JSON.stringify({ type: "watch", tokens: auth.tokens().slice(0, 20) }));
  };

  const connect = () => {
    if (stopped || typeof window === "undefined") return;
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const next = new WebSocket(`${protocol}//${window.location.host}/live`);
    socket = next;
    next.onopen = () => {
      delay = 1000;
      sendAuth();
    };
    next.onmessage = (message) => {
      try {
        onEvent(JSON.parse(String(message.data)) as LiveEvent);
      } catch {
        // Ignore a frame that is not JSON.
      }
    };
    next.onclose = () => {
      if (stopped) return;
      timer = window.setTimeout(connect, delay);
      delay = Math.min(delay * 2, 20000);
    };
  };

  connect();

  return {
    close() {
      stopped = true;
      window.clearTimeout(timer);
      socket?.close();
      socket = null;
    },
  };
}
