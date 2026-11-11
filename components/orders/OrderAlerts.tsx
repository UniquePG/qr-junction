"use client";

import { openLiveSocket, type LiveEvent } from "@/lib/live/client";
import { restaurantService } from "@/lib/api";
import { formatTableLabel, orderCallCode } from "@/lib/orders/displayId";
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
  /** Call after saving Settings → orderSound so live alerts match without a refresh. */
  setOrderSoundPreferred: (preferred: boolean) => void;
};

const OrderAlertsContext = createContext<OrderAlertsValue>({
  placedCount: 0,
  liveTick: 0,
  soundReady: false,
  orderSoundPreferred: false,
  enableSound: () => {},
  setOrderSoundPreferred: () => {},
});

export function useOrderAlerts() {
  return useContext(OrderAlertsContext);
}

function getPlayer(existing: HTMLAudioElement | null) {
  const player = existing ?? new Audio(SOUND_SRC);
  player.preload = "auto";
  player.volume = 1;
  return player;
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
  const unlockedRef = useRef(false);

  const markUnlocked = useCallback(() => {
    unlockedRef.current = true;
    setSoundReady(true);
    try {
      sessionStorage.setItem(SOUND_KEY, "1");
    } catch {
      // private mode / blocked storage
    }
  }, []);

  const markLocked = useCallback(() => {
    unlockedRef.current = false;
    setSoundReady(false);
    try {
      sessionStorage.removeItem(SOUND_KEY);
    } catch {
      // ignore
    }
  }, []);

  const play = useCallback(() => {
    if (!preferredRef.current) return;
    const player = getPlayer(audio.current);
    audio.current = player;
    try {
      player.pause();
      player.currentTime = 0;
    } catch {
      // ignore seek errors before metadata
    }
    void player
      .play()
      .then(() => {
        markUnlocked();
      })
      .catch(() => {
        // Autoplay blocked until a user gesture unlocks audio.
        markLocked();
      });
  }, [markLocked, markUnlocked]);

  const setOrderSoundPreferredValue = useCallback(
    (preferred: boolean) => {
      preferredRef.current = preferred;
      setOrderSoundPreferred(preferred);
      if (!preferred) markLocked();
    },
    [markLocked],
  );

  const enableSound = useCallback(() => {
    // Unlock must run inside a user gesture. Treat this as “sound wanted” for this session.
    preferredRef.current = true;
    setOrderSoundPreferred(true);
    const player = getPlayer(audio.current);
    audio.current = player;
    // Near-silent unlock so the first tap does not blast the kitchen chime.
    player.volume = 0.001;
    void player
      .play()
      .then(() => {
        player.pause();
        try {
          player.currentTime = 0;
        } catch {
          // ignore
        }
        player.volume = 1;
        markUnlocked();
      })
      .catch(() => {
        player.volume = 1;
        markLocked();
      });
  }, [markLocked, markUnlocked]);

  // Load restaurant preference. Never claim "ready" without a real unlock gesture.
  useEffect(() => {
    audio.current = getPlayer(null);
    let cancelled = false;
    const syncPreference = async () => {
      try {
        const res = await restaurantService.getSettings();
        if (!res.ok || cancelled) return;
        const preferred = Boolean(res.data.settings?.orderSound);
        preferredRef.current = preferred;
        setOrderSoundPreferred(preferred);
        if (!preferred) {
          markLocked();
          return;
        }
        // Preference on ≠ browser unlocked. Keep banner until a tap succeeds.
        let hadSessionUnlock = false;
        try {
          hadSessionUnlock = sessionStorage.getItem(SOUND_KEY) === "1";
        } catch {
          hadSessionUnlock = false;
        }
        if (!hadSessionUnlock) {
          setSoundReady(false);
          unlockedRef.current = false;
        } else {
          // Session says unlocked before, but reload still needs a gesture in most browsers.
          setSoundReady(false);
          unlockedRef.current = false;
        }
      } catch {
        // Settings may 400 before profile exists — ignore.
      }
    };
    void syncPreference();
    return () => {
      cancelled = true;
    };
  }, [markLocked]);

  // Unlock on the first real user gesture while order sound is preferred.
  useEffect(() => {
    if (!orderSoundPreferred || soundReady) return;

    const unlock = () => {
      if (!preferredRef.current || unlockedRef.current) return;
      enableSound();
    };

    window.addEventListener("pointerdown", unlock, { once: true, capture: true });
    window.addEventListener("keydown", unlock, { once: true, capture: true });
    return () => {
      window.removeEventListener("pointerdown", unlock, true);
      window.removeEventListener("keydown", unlock, true);
    };
  }, [enableSound, orderSoundPreferred, soundReady]);

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
      const where = formatTableLabel(event.order?.tableNumber);
      const callCode = event.order?.publicId
        ? orderCallCode(event.order.publicId, event.order.tableNumber)
        : "";
      toast.info(`New plate from ${where}`);
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        new Notification("New plate", { body: callCode ? `${where} · ${callCode}` : where });
      }
      if (preferredRef.current) play();
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
      value={{
        placedCount,
        liveTick,
        soundReady,
        orderSoundPreferred,
        enableSound,
        setOrderSoundPreferred: setOrderSoundPreferredValue,
      }}
    >
      {children}
    </OrderAlertsContext.Provider>
  );
}
