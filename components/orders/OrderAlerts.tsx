"use client";

import { openLiveSocket, type LiveEvent } from "@/lib/live/client";
import { restaurantService } from "@/lib/api";
import { orderCallCode } from "@/lib/orders/displayId";
import { toast } from "react-toastify";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const SOUND_KEY = "qj-kitchen-sound";
const SOUND_SRC = "/sounds/Notification3.mp3";

type OrderAlertsValue = {
  placedCount: number;
  liveTick: number;
  soundReady: boolean;
  orderSoundPreferred: boolean;
  enableSound: () => void;
};

const OrderAlertsContext = createContext<OrderAlertsValue>({
  placedCount: 0,
  liveTick: 0,
  soundReady: false,
  orderSoundPreferred: false,
  enableSound: () => {},
});

export function useOrderAlerts() {
  return useContext(OrderAlertsContext);
}

export function OrderAlertsProvider({ children }: { children: React.ReactNode }) {
  const [placedCount, setPlacedCount] = useState(0);
  const [liveTick, setLiveTick] = useState(0);
  const [soundReady, setSoundReady] = useState(false);
  const [orderSoundPreferred, setOrderSoundPreferred] = useState(false);
  const seen = useRef(new Set<string>());
  const audio = useRef<HTMLAudioElement | null>(null);
  const hadReady = useRef(false);
  const preferredRef = useRef(false);

  const play = useCallback(() => {
    if (!preferredRef.current) return;
    const player = audio.current;
    if (!player) return;
    player.currentTime = 0;
    void player.play().then(() => setSoundReady(true)).catch(() => setSoundReady(false));
  }, []);

  const enableSound = useCallback(() => {
    const player = audio.current ?? new Audio(SOUND_SRC);
    audio.current = player;
    player.volume = 1;
    void player.play().then(() => {
      player.pause();
      player.currentTime = 0;
      setSoundReady(true);
      sessionStorage.setItem(SOUND_KEY, "1");
    }).catch(() => setSoundReady(false));
  }, []);

  useEffect(() => {
    audio.current = new Audio(SOUND_SRC);
    let cancelled = false;
    const syncPreference = async () => {
      try {
        const res = await restaurantService.getSettings();
        if (!res.ok || cancelled) return;
        const preferred = Boolean(res.data.settings?.orderSound);
        preferredRef.current = preferred;
        setOrderSoundPreferred(preferred);
        if (preferred) {
          sessionStorage.setItem(SOUND_KEY, "1");
          setSoundReady(true);
        } else {
          sessionStorage.removeItem(SOUND_KEY);
          setSoundReady(false);
        }
      } catch {
        // Settings may 400 before profile exists — ignore.
      }
    };
    void syncPreference();
    return () => {
      cancelled = true;
    };
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
      const callCode = event.order?.publicId
        ? orderCallCode(event.order.publicId, event.order.tableNumber)
        : "";
      toast.info(`New plate from ${where}`);
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        new Notification("New plate", { body: callCode ? `${where} · ${callCode}` : where });
      }
      if (preferredRef.current && sessionStorage.getItem(SOUND_KEY) === "1") play();
    };

    const connection = openLiveSocket(
      {
        role: "kitchen",
        token: async () => null,
      },
      onEvent,
    );
    return () => connection.close();
  }, [play]);

  return (
    <OrderAlertsContext.Provider
      value={{ placedCount, liveTick, soundReady, orderSoundPreferred, enableSound }}
    >
      {children}
    </OrderAlertsContext.Provider>
  );
}
