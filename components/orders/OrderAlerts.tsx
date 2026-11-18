"use client";

import { useAuth } from "@/components/AuthContext";
import { openLiveSocket, type LiveEvent } from "@/lib/live/client";
import { restaurantService } from "@/lib/api";
import { formatTableLabel, orderCallCode } from "@/lib/orders/displayId";
import { hasPermission, type StaffPermissionKey } from "@/lib/restaurant/staff/permissions";
import { WAITER_REASON_LABELS, type WaiterReason } from "@/lib/waiter/types";
import { toast } from "@/lib/toast";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

function staffCan(permissions: string[] | "ALL" | null | undefined, key: StaffPermissionKey) {
  if (permissions == null) return true; // owner/bootstrap before access loads
  return hasPermission(permissions, key);
}

const ORDER_SOUND_KEY = "qj-kitchen-sound";
const WAITER_SOUND_KEY = "qj-waiter-sound";
/** Live ordering chime — do not change. */
const ORDER_SOUND_SRC = "/sounds/Notification3.mp3";
/** Call waiter chime — separate from live ordering. */
const WAITER_SOUND_SRC = "/sounds/call_waiter_ring2.mp3";

export type WaiterRequestAlert = {
  id: number;
  tableNumber: string;
  reason: string;
  status: string;
  createdAt: string;
};

type OrderAlertsValue = {
  placedCount: number;
  waiterPendingCount: number;
  waiterTick: number;
  liveTick: number;
  soundReady: boolean;
  orderSoundPreferred: boolean;
  waiterSoundReady: boolean;
  waiterSoundPreferred: boolean;
  enableSound: () => void;
  enableWaiterSound: () => void;
  /** Call after saving Settings → orderSound so live alerts match without a refresh. */
  setOrderSoundPreferred: (preferred: boolean) => void;
  setWaiterSoundPreferred: (preferred: boolean) => void;
  refreshWaiterPending: () => Promise<void>;
};

const OrderAlertsContext = createContext<OrderAlertsValue>({
  placedCount: 0,
  waiterPendingCount: 0,
  waiterTick: 0,
  liveTick: 0,
  soundReady: false,
  orderSoundPreferred: false,
  waiterSoundReady: false,
  waiterSoundPreferred: false,
  enableSound: () => {},
  enableWaiterSound: () => {},
  setOrderSoundPreferred: () => {},
  setWaiterSoundPreferred: () => {},
  refreshWaiterPending: async () => {},
});

export function useOrderAlerts() {
  return useContext(OrderAlertsContext);
}

function getPlayer(existing: HTMLAudioElement | null, src: string) {
  const player = existing ?? new Audio();
  // Always pin the expected file — reused elements can keep a stale src.
  if (!player.src || !player.src.includes(src.replace(/^\//, ""))) {
    player.src = src;
  }
  player.preload = "auto";
  player.volume = 1;
  return player;
}

function reasonLabel(reason: string | undefined) {
  if (reason && reason in WAITER_REASON_LABELS) {
    return WAITER_REASON_LABELS[reason as WaiterReason];
  }
  return "Help";
}

export function OrderAlertsProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const permissions = user?.restaurantAccess?.permissions ?? null;
  const canSettings = staffCan(permissions, "settings.view");
  const canWaiter = staffCan(permissions, "waiter.view");
  const canOrders = staffCan(permissions, "orders.view");

  const [placedCount, setPlacedCount] = useState(0);
  const [waiterPendingCount, setWaiterPendingCount] = useState(0);
  const [waiterTick, setWaiterTick] = useState(0);
  const [liveTick, setLiveTick] = useState(0);
  const [soundReady, setSoundReady] = useState(false);
  const [orderSoundPreferred, setOrderSoundPreferred] = useState(false);
  const [waiterSoundReady, setWaiterSoundReady] = useState(false);
  const [waiterSoundPreferred, setWaiterSoundPreferred] = useState(false);

  const seen = useRef(new Set<string>());
  const orderAudio = useRef<HTMLAudioElement | null>(null);
  const waiterAudio = useRef<HTMLAudioElement | null>(null);
  const hadReady = useRef(false);

  const orderPreferredRef = useRef(false);
  const orderUnlockedRef = useRef(false);
  const waiterPreferredRef = useRef(false);
  const waiterUnlockedRef = useRef(false);

  const markOrderUnlocked = useCallback(() => {
    orderUnlockedRef.current = true;
    setSoundReady(true);
    try {
      sessionStorage.setItem(ORDER_SOUND_KEY, "1");
    } catch {
      // private mode / blocked storage
    }
  }, []);

  const markOrderLocked = useCallback(() => {
    orderUnlockedRef.current = false;
    setSoundReady(false);
    try {
      sessionStorage.removeItem(ORDER_SOUND_KEY);
    } catch {
      // ignore
    }
  }, []);

  const markWaiterUnlocked = useCallback(() => {
    waiterUnlockedRef.current = true;
    setWaiterSoundReady(true);
    try {
      sessionStorage.setItem(WAITER_SOUND_KEY, "1");
    } catch {
      // private mode / blocked storage
    }
  }, []);

  const markWaiterLocked = useCallback(() => {
    waiterUnlockedRef.current = false;
    setWaiterSoundReady(false);
    try {
      sessionStorage.removeItem(WAITER_SOUND_KEY);
    } catch {
      // ignore
    }
  }, []);

  const playOrder = useCallback(() => {
    if (!orderPreferredRef.current) return;
    const player = getPlayer(orderAudio.current, ORDER_SOUND_SRC);
    orderAudio.current = player;
    try {
      player.pause();
      player.currentTime = 0;
    } catch {
      // ignore seek errors before metadata
    }
    void player
      .play()
      .then(() => {
        markOrderUnlocked();
      })
      .catch(() => {
        markOrderLocked();
      });
  }, [markOrderLocked, markOrderUnlocked]);

  const playWaiter = useCallback(() => {
    if (!waiterPreferredRef.current) return;
    const player = getPlayer(waiterAudio.current, WAITER_SOUND_SRC);
    waiterAudio.current = player;
    player.src = WAITER_SOUND_SRC;
    try {
      player.pause();
      player.load();
      player.currentTime = 0;
    } catch {
      // ignore seek/load errors before metadata
    }
    void player
      .play()
      .then(() => {
        markWaiterUnlocked();
      })
      .catch(() => {
        // Autoplay blocked until a real user gesture unlocks audio.
        markWaiterLocked();
      });
  }, [markWaiterLocked, markWaiterUnlocked]);

  const setOrderSoundPreferredValue = useCallback(
    (preferred: boolean) => {
      orderPreferredRef.current = preferred;
      setOrderSoundPreferred(preferred);
      if (!preferred) markOrderLocked();
    },
    [markOrderLocked],
  );

  const setWaiterSoundPreferredValue = useCallback(
    (preferred: boolean) => {
      waiterPreferredRef.current = preferred;
      setWaiterSoundPreferred(preferred);
      if (!preferred) markWaiterLocked();
    },
    [markWaiterLocked],
  );

  const enableSound = useCallback(() => {
    orderPreferredRef.current = true;
    setOrderSoundPreferred(true);
    // Optimistic unlock on the user gesture so settings UI does not flash "Tap to unlock".
    markOrderUnlocked();
    const player = getPlayer(orderAudio.current, ORDER_SOUND_SRC);
    orderAudio.current = player;
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
        markOrderUnlocked();
      })
      .catch(() => {
        player.volume = 1;
        markOrderLocked();
      });
  }, [markOrderLocked, markOrderUnlocked]);

  const enableWaiterSound = useCallback(() => {
    waiterPreferredRef.current = true;
    setWaiterSoundPreferred(true);
    markWaiterUnlocked();
    const player = getPlayer(waiterAudio.current, WAITER_SOUND_SRC);
    waiterAudio.current = player;
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
        markWaiterUnlocked();
      })
      .catch(() => {
        player.volume = 1;
        markWaiterLocked();
      });
  }, [markWaiterLocked, markWaiterUnlocked]);

  const refreshWaiterPending = useCallback(async () => {
    if (!canWaiter) return;
    try {
      const res = await restaurantService.listWaiterRequests();
      if (!res.ok) return;
      setWaiterPendingCount(Number(res.data.pendingCount) || 0);
      setWaiterTick((tick) => tick + 1);
    } catch {
      // ignore before profile exists
    }
  }, [canWaiter]);

  useEffect(() => {
    if (authLoading || !user?.restaurantAccess) return;

    orderAudio.current = getPlayer(null, ORDER_SOUND_SRC);
    waiterAudio.current = getPlayer(null, WAITER_SOUND_SRC);
    let cancelled = false;

    const sessionFlag = (key: string) => {
      try {
        return sessionStorage.getItem(key) === "1";
      } catch {
        return false;
      }
    };

    const applySoundPrefs = (orderPreferred: boolean, waiterPreferred: boolean) => {
      if (cancelled) return;
      orderPreferredRef.current = orderPreferred;
      setOrderSoundPreferred(orderPreferred);
      waiterPreferredRef.current = waiterPreferred;
      setWaiterSoundPreferred(waiterPreferred);

      if (!orderPreferred) {
        markOrderLocked();
      } else if (sessionFlag(ORDER_SOUND_KEY)) {
        // Same tab/session already unlocked — keep banner hidden across refresh.
        orderUnlockedRef.current = true;
        setSoundReady(true);
      } else {
        orderUnlockedRef.current = false;
        setSoundReady(false);
      }

      if (!waiterPreferred) {
        markWaiterLocked();
      } else if (sessionFlag(WAITER_SOUND_KEY)) {
        waiterUnlockedRef.current = true;
        setWaiterSoundReady(true);
      } else {
        waiterUnlockedRef.current = false;
        setWaiterSoundReady(false);
      }
    };

    const syncPreference = async () => {
      // Only hit settings when the staff role can view them; otherwise use local defaults.
      if (!canSettings) {
        applySoundPrefs(canOrders, canWaiter);
        return;
      }
      try {
        const res = await restaurantService.getSettings();
        if (!res.ok || cancelled) return;
        applySoundPrefs(
          Boolean(res.data.settings?.orderSound),
          Boolean(res.data.settings?.waiterSound),
        );
      } catch {
        // Settings may 400 before profile exists — ignore.
      }
    };
    void syncPreference();
    void refreshWaiterPending();
    return () => {
      cancelled = true;
    };
  }, [
    authLoading,
    user?.restaurantAccess,
    canSettings,
    canOrders,
    canWaiter,
    markOrderLocked,
    markWaiterLocked,
    refreshWaiterPending,
  ]);

  // After refresh the Audio element is new — re-arm on the first gesture even if the
  // session banner is already hidden. Failures clear the session flag and show the banner again.
  useEffect(() => {
    if (!orderSoundPreferred) return;

    const unlock = () => {
      if (!orderPreferredRef.current) return;
      enableSound();
    };

    window.addEventListener("pointerdown", unlock, { once: true, capture: true });
    window.addEventListener("keydown", unlock, { once: true, capture: true });
    return () => {
      window.removeEventListener("pointerdown", unlock, true);
      window.removeEventListener("keydown", unlock, true);
    };
  }, [enableSound, orderSoundPreferred]);

  useEffect(() => {
    if (!waiterSoundPreferred) return;

    const unlock = () => {
      if (!waiterPreferredRef.current) return;
      enableWaiterSound();
    };

    window.addEventListener("pointerdown", unlock, { once: true, capture: true });
    window.addEventListener("keydown", unlock, { once: true, capture: true });
    return () => {
      window.removeEventListener("pointerdown", unlock, true);
      window.removeEventListener("keydown", unlock, true);
    };
  }, [enableWaiterSound, waiterSoundPreferred]);

  useEffect(() => {
    const onEvent = (event: LiveEvent) => {
      if (event.type === "ready") {
        if (typeof event.placedCount === "number") setPlacedCount(event.placedCount);
        if (typeof event.waiterPendingCount === "number") setWaiterPendingCount(event.waiterPendingCount);
        if (hadReady.current) {
          setLiveTick((tick) => tick + 1);
          setWaiterTick((tick) => tick + 1);
        }
        hadReady.current = true;
        return;
      }

      if (event.type === "waiter.request.created" || event.type === "waiter.request.updated") {
        if (typeof event.waiterPendingCount === "number") {
          setWaiterPendingCount(event.waiterPendingCount);
        } else {
          void refreshWaiterPending();
        }
        setWaiterTick((tick) => tick + 1);
        if (event.type !== "waiter.request.created") return;
        const key = `waiter-${event.id || event.request?.id}`;
        if (!key || seen.current.has(key)) return;
        seen.current.add(key);
        const where = formatTableLabel(event.request?.tableNumber);
        const need = reasonLabel(event.request?.reason);
        toast.info(`${where} · ${need}`);
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification("Waiter requested", { body: `${where} · ${need}` });
        }
        if (waiterPreferredRef.current) playWaiter();
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
      if (orderPreferredRef.current) playOrder();
    };

    const connection = openLiveSocket(
      {
        role: "kitchen",
        token: async () => null,
      },
      onEvent,
    );
    return () => connection.close();
  }, [playOrder, playWaiter, refreshWaiterPending]);

  return (
    <OrderAlertsContext.Provider
      value={{
        placedCount,
        waiterPendingCount,
        waiterTick,
        liveTick,
        soundReady,
        orderSoundPreferred,
        waiterSoundReady,
        waiterSoundPreferred,
        enableSound,
        enableWaiterSound,
        setOrderSoundPreferred: setOrderSoundPreferredValue,
        setWaiterSoundPreferred: setWaiterSoundPreferredValue,
        refreshWaiterPending,
      }}
    >
      {children}
    </OrderAlertsContext.Provider>
  );
}
