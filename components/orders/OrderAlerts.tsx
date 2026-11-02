"use client";

import { openLiveSocket, type LiveEvent } from "@/lib/live/client";
import { toast } from "react-toastify";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

type OrderAlertsValue = {
  placedCount: number;
  liveTick: number;
  soundReady: boolean;
  enableSound: () => void;
};

const OrderAlertsContext = createContext<OrderAlertsValue>({
  placedCount: 0,
  liveTick: 0,
  soundReady: false,
  enableSound: () => {},
});

export function useOrderAlerts() {
  return useContext(OrderAlertsContext);
}

export function OrderAlertsProvider({ children }: { children: React.ReactNode }) {
  const [placedCount, setPlacedCount] = useState(0);
  const [liveTick, setLiveTick] = useState(0);
  const [soundReady, setSoundReady] = useState(false);
  const seen = useRef(new Set<string>());
  const audio = useRef<HTMLAudioElement | null>(null);
  const hadReady = useRef(false);

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
    const onEvent = (event: LiveEvent) => {
      if (event.type === "ready") {
        if (typeof event.placedCount === "number") setPlacedCount(event.placedCount);
        if (hadReady.current) setLiveTick((tick) => tick + 1);
        hadReady.current = true;
        return;
      }
      if (event.type !== "order.placed" && event.type !== "order.updated") return;
      if (typeof event.placedCount === "number") setPlacedCount(event.placedCount);
      setLiveTick((tick) => tick + 1);
      if (event.type !== "order.placed") return;
      const key = event.id || event.order?.publicId;
      if (!key || seen.current.has(key)) return;
      seen.current.add(key);
      const where = event.order?.tableNumber ? `Table ${event.order.tableNumber}` : "Counter";
      toast.info(`New plate from ${where}`);
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        new Notification("New plate", { body: `${where} · ${event.order?.publicId || ""}` });
      }
      if (sessionStorage.getItem("qj-kitchen-sound") === "1") play();
    };

    const connection = openLiveSocket(
      {
        role: "kitchen",
        // Session cookie is sent on the WebSocket upgrade; token optional.
        token: async () => null,
      },
      onEvent,
    );
    return () => connection.close();
  }, [play]);

  return (
    <OrderAlertsContext.Provider value={{ placedCount, liveTick, soundReady, enableSound }}>
      {children}
    </OrderAlertsContext.Provider>
  );
}
