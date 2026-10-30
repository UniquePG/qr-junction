"use client";

import { auth } from "@/lib/firebase";
import { toast } from "react-toastify";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

type OrderAlertsValue = {
  placedCount: number;
  soundReady: boolean;
  enableSound: () => void;
};

const OrderAlertsContext = createContext<OrderAlertsValue>({
  placedCount: 0,
  soundReady: false,
  enableSound: () => {},
});

export function useOrderAlerts() {
  return useContext(OrderAlertsContext);
}

async function authHeader() {
  const user = auth.currentUser;
  if (!user) return null;
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

export function OrderAlertsProvider({ children }: { children: React.ReactNode }) {
  const [placedCount, setPlacedCount] = useState(0);
  const [soundReady, setSoundReady] = useState(false);
  const seen = useRef(new Set<string>());
  const audio = useRef<HTMLAudioElement | null>(null);

  const play = useCallback(() => {
    const player = audio.current;
    if (!player) return;
    player.currentTime = 0;
    void player.play().then(() => setSoundReady(true)).catch(() => setSoundReady(false));
  }, []);

  const enableSound = useCallback(() => {
    const player = audio.current ?? new Audio("/sounds/new-order.mp3");
    audio.current = player;
    player.volume = 1;
    void player.play().then(() => {
      player.pause();
      player.currentTime = 0;
      setSoundReady(true);
      sessionStorage.setItem("qj-kitchen-sound", "1");
    }).catch(() => setSoundReady(false));
  }, []);

  useEffect(() => {
    audio.current = new Audio("/sounds/new-order.mp3");
    if (sessionStorage.getItem("qj-kitchen-sound") === "1") setSoundReady(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let controller: AbortController | null = null;

    const handle = (raw: string) => {
      const blocks = raw.split("\n\n");
      for (const block of blocks) {
        const dataLine = block.split("\n").find((line) => line.startsWith("data:"));
        const eventLine = block.split("\n").find((line) => line.startsWith("event:"));
        if (!dataLine) continue;
        const eventName = eventLine?.slice(6).trim();
        let payload: { id?: string; type?: string; placedCount?: number; order?: { publicId?: string; tableNumber?: string | null } };
        try {
          payload = JSON.parse(dataLine.slice(5).trim());
        } catch {
          continue;
        }
        if (typeof payload.placedCount === "number") setPlacedCount(payload.placedCount);
        if ((eventName || payload.type) !== "order.placed") continue;
        const key = payload.id || payload.order?.publicId;
        if (!key || seen.current.has(key)) continue;
        seen.current.add(key);
        const where = payload.order?.tableNumber ? `Table ${payload.order.tableNumber}` : "Counter";
        toast.info(`New plate from ${where}`);
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification("New plate", { body: `${where} · ${payload.order?.publicId || ""}` });
        }
        if (sessionStorage.getItem("qj-kitchen-sound") === "1") play();
      }
    };

    const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

    const run = async () => {
      while (!cancelled) {
        try {
          const headers = await authHeader();
          if (!headers) {
            await wait(1500);
            continue;
          }
          const list = await fetch("/api/restaurant/orders", { headers });
          if (list.ok) {
            const data = await list.json();
            if (!cancelled) {
              setPlacedCount(Number(data.placedCount) || 0);
            }
          }
          controller = new AbortController();
          const response = await fetch("/api/restaurant/orders/stream", {
            headers: { ...headers, Accept: "text/event-stream" },
            signal: controller.signal,
          });
          if (!response.ok || !response.body) throw new Error("stream");
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";
          while (!cancelled) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const parts = buffer.split("\n\n");
            buffer = parts.pop() || "";
            if (parts.length) handle(parts.join("\n\n"));
          }
        } catch {
          // reconnect after a dropped stream
        }
        if (!cancelled) await wait(2000);
      }
    };

    void run();
    return () => {
      cancelled = true;
      controller?.abort();
    };
  }, [play]);

  return (
    <OrderAlertsContext.Provider value={{ placedCount, soundReady, enableSound }}>
      {children}
    </OrderAlertsContext.Provider>
  );
}
