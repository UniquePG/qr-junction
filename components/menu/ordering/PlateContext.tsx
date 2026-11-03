"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { MenuItem } from "@/components/menu/types";
import { newIdempotencyKey } from "@/components/menu/ordering/ids";
import { openLiveSocket } from "@/lib/live/client";
import { PlateChrome } from "@/components/menu/ordering/PlateChrome";
import { addLabelForTheme } from "@/components/menu/ordering/wording";

export type PlateLine = {
  key: string;
  item: MenuItem;
  variantLabel: string | null;
  unitPrice: number;
  quantity: number;
};

export type LiveOrder = {
  publicId: string;
  publicToken: string;
  status: string;
  tableNumber: string | null;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  taxName: string;
  customerNote?: string | null;
  rejectReason: string | null;
  expectedReadyAt: string | null;
  paidAt?: string | null;
  digitalBillEnabled?: boolean;
  items: Array<{ name: string; variantLabel: string | null; unitPrice: number; quantity: number; lineTotal: number }>;
  events?: Array<{ status: string; note: string | null; createdAt: string }>;
  createdAt: string;
};

type Quote = {
  lines: Array<{ menuItemId: number; name: string; variantLabel: string | null; unitPrice: number; quantity: number; lineTotal: number }>;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  taxName: string;
  taxRate: number;
};

type PlateApi = {
  enabled: boolean;
  addLabel: string;
  lines: PlateLine[];
  count: number;
  add: (item: MenuItem, variantLabel: string | null) => void;
  setQuantity: (item: MenuItem, variantLabel: string | null, quantity: number) => void;
  quantity: (itemId: number, variantLabel: string | null) => number;
  quantityForItem: (itemId: number) => number;
  openItem: (item: MenuItem) => void;
  openConfirm: () => void;
  liveOrders: LiveOrder[];
};

const PlateContext = createContext<PlateApi | null>(null);

export function usePlate() {
  return useContext(PlateContext);
}

function lineKey(itemId: number, variantLabel: string | null) {
  return `${itemId}:${variantLabel || ""}`;
}

function unitPrice(item: MenuItem, variantLabel: string | null) {
  if (variantLabel && item.variants?.length) {
    const match = item.variants.find((variant) => variant.label === variantLabel);
    return Number(match?.price ?? item.price);
  }
  return Number(item.price);
}

const CUSTOMER_KEY = "qj-customer";
function ordersKey(restaurantId: number) {
  return `qj-orders:${restaurantId}`;
}

function readCustomer() {
  if (typeof window === "undefined") return { name: "", phone: "" };
  try {
    const parsed = JSON.parse(localStorage.getItem(CUSTOMER_KEY) || "{}");
    return { name: String(parsed.name || ""), phone: String(parsed.phone || "") };
  } catch {
    return { name: "", phone: "" };
  }
}

function identityComplete(value: { name: string; phone: string }) {
  return value.name.trim().length > 0 && value.phone.replace(/\D/g, "").length >= 10;
}

export function PlateProvider({
  enabled,
  theme,
  restaurantId,
  menuId,
  tableNumber,
  currencySymbol,
  onOpenItem,
  children,
}: {
  enabled: boolean;
  theme: string;
  restaurantId: number;
  menuId: number;
  tableNumber: string | null;
  currencySymbol: string;
  onOpenItem: (item: MenuItem) => void;
  children: React.ReactNode;
}) {
  const [lines, setLines] = useState<PlateLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [trackerOpen, setTrackerOpen] = useState(false);
  const [customer, setCustomer] = useState({ name: "", phone: "" });
  const [savedCustomer, setSavedCustomer] = useState({ name: "", phone: "" });
  const [editingIdentity, setEditingIdentity] = useState(false);
  const [note, setNote] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteError, setQuoteError] = useState("");
  const [sending, setSending] = useState(false);
  const [sendKey, setSendKey] = useState("");
  const [liveOrders, setLiveOrders] = useState<LiveOrder[]>([]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const stored = readCustomer();
    setCustomer(stored);
    setSavedCustomer(stored);
    setEditingIdentity(!identityComplete(stored));
    try {
      const stored = JSON.parse(localStorage.getItem(ordersKey(restaurantId)) || "[]");
      if (Array.isArray(stored) && stored.length) {
        void Promise.all(
          stored.slice(0, 20).map(async (row: { publicToken?: string }) => {
            if (!row.publicToken) return null;
            const response = await fetch(`/api/public/orders?token=${encodeURIComponent(row.publicToken)}`);
            if (!response.ok) return null;
            const data = await response.json();
            return data.order as LiveOrder;
          }),
        ).then((rows) => {
          setLiveOrders(rows.filter((row): row is LiveOrder => Boolean(row)));
        });
      }
    } catch {
      // ignore a bad local cache
    }
  }, [restaurantId]);

  const add = useCallback((item: MenuItem, variantLabel: string | null) => {
    if (item.variants?.length && !variantLabel) {
      onOpenItem(item);
      return;
    }
    const key = lineKey(item.id, variantLabel);
    setLines((current) => {
      const found = current.find((line) => line.key === key);
      if (found) {
        return current.map((line) => line.key === key ? { ...line, quantity: Math.min(20, line.quantity + 1) } : line);
      }
      return [...current, { key, item, variantLabel, unitPrice: unitPrice(item, variantLabel), quantity: 1 }];
    });
  }, [onOpenItem]);

  const setQuantity = useCallback((item: MenuItem, variantLabel: string | null, quantity: number) => {
    const key = lineKey(item.id, variantLabel);
    setLines((current) => {
      if (quantity <= 0) return current.filter((line) => line.key !== key);
      const next = Math.min(20, quantity);
      const found = current.find((line) => line.key === key);
      if (!found) return [...current, { key, item, variantLabel, unitPrice: unitPrice(item, variantLabel), quantity: next }];
      return current.map((line) => line.key === key ? { ...line, quantity: next } : line);
    });
  }, []);

  const quantity = useCallback((itemId: number, variantLabel: string | null) => {
    return lines.find((line) => line.key === lineKey(itemId, variantLabel))?.quantity ?? 0;
  }, [lines]);

  const quantityForItem = useCallback((itemId: number) => {
    return lines.filter((line) => line.item.id === itemId).reduce((sum, line) => sum + line.quantity, 0);
  }, [lines]);

  const count = lines.reduce((sum, line) => sum + line.quantity, 0);

  const refreshQuote = useCallback(async () => {
    setQuoteError("");
    const response = await fetch("/api/public/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quoteOnly: true,
        restaurantId,
        menuId,
        items: lines.map((line) => ({
          menuItemId: line.item.id,
          variantLabel: line.variantLabel,
          quantity: line.quantity,
        })),
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      setQuote(null);
      setQuoteError(data.message || data.error || "This plate needs a look.");
      return;
    }
    setQuote(data.quote);
  }, [lines, menuId, restaurantId]);

  const openCart = useCallback(() => {
    setSendKey(newIdempotencyKey());
    setTrackerOpen(false);
    setCartOpen(true);
  }, []);

  useEffect(() => {
    if (cartOpen && lines.length) void refreshQuote();
  }, [cartOpen, lines, refreshQuote]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 15000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const locked = cartOpen || trackerOpen;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen, trackerOpen]);

  const remember = useCallback((order: LiveOrder) => {
    const stored = (() => {
      try {
        return JSON.parse(localStorage.getItem(ordersKey(restaurantId)) || "[]");
      } catch {
        return [];
      }
    })();
    const next = [{ publicToken: order.publicToken, publicId: order.publicId }, ...stored.filter((row: { publicToken?: string }) => row.publicToken !== order.publicToken)].slice(0, 20);
    localStorage.setItem(ordersKey(restaurantId), JSON.stringify(next));
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer));
    setSavedCustomer(customer);
    setEditingIdentity(false);
    setLiveOrders((current) => [order, ...current.filter((row) => row.publicId !== order.publicId)]);
  }, [customer, restaurantId]);

  const send = useCallback(async () => {
    setSending(true);
    setQuoteError("");
    try {
      const response = await fetch("/api/public/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          menuId,
          tableNumber,
          customerName: customer.name,
          customerPhone: customer.phone,
          note,
          idempotencyKey: sendKey,
          items: lines.map((line) => ({
            menuItemId: line.item.id,
            variantLabel: line.variantLabel,
            quantity: line.quantity,
          })),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setQuoteError(data.message || data.error || "The kitchen did not get this plate.");
        if (data.code === "UNAVAILABLE" || data.code === "UNKNOWN_ITEM") void refreshQuote();
        return;
      }
      setLines([]);
      setNote("");
      setCartOpen(false);
      setTrackerOpen(true);
      remember(data.order);
    } finally {
      setSending(false);
    }
  }, [customer, lines, menuId, note, refreshQuote, remember, restaurantId, sendKey, tableNumber]);

  const watchKey = liveOrders
    .filter((order) => order.status !== "REJECTED" && !(order.status === "SERVED" && order.paidAt))
    .map((order) => order.publicToken)
    .join("|");

  useEffect(() => {
    if (!watchKey) return;
    const tokens = watchKey.split("|");
    const connection = openLiveSocket({ role: "guest", tokens: () => tokens }, (event) => {
      if ((event.type !== "order.updated" && event.type !== "order.placed") || !event.order?.publicId) return;
      const incoming = event.order;
      setLiveOrders((current) => current.map((row) => row.publicId === incoming.publicId ? { ...row, ...incoming } : row));
    });
    return () => connection.close();
  }, [watchKey]);

  const api = useMemo<PlateApi>(() => ({
    enabled,
    addLabel: addLabelForTheme(theme),
    lines,
    count,
    add,
    setQuantity,
    quantity,
    quantityForItem,
    openItem: onOpenItem,
    openConfirm: openCart,
    liveOrders,
  }), [add, count, enabled, lines, liveOrders, onOpenItem, openCart, quantity, quantityForItem, setQuantity, theme]);

  const identityLocked = liveOrders.some((order) => !["SERVED", "REJECTED"].includes(order.status));

  const saveIdentity = () => {
    if (!identityComplete(customer) || identityLocked) return;
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer));
    setSavedCustomer(customer);
    setEditingIdentity(false);
  };

  return (
    <PlateContext.Provider value={enabled ? api : { ...api, enabled: false }}>
      {children}
      {enabled ? <div className="h-24" /> : null}
      {enabled ? (
        <PlateChrome
          count={count}
          lines={lines}
          quote={quote}
          quoteError={quoteError}
          sending={sending}
          currencySymbol={currencySymbol}
          tableNumber={tableNumber}
          customer={customer}
          note={note}
          hasSavedIdentity={identityComplete(savedCustomer)}
          editingIdentity={editingIdentity && identityComplete(savedCustomer)}
          identityLocked={identityLocked}
          cartOpen={cartOpen}
          trackerOpen={trackerOpen}
          liveOrders={liveOrders}
          now={now}
          onOpenCart={openCart}
          onCloseCart={() => {
            if (sending) return;
            if (identityComplete(savedCustomer)) {
              setCustomer(savedCustomer);
              setEditingIdentity(false);
            }
            setCartOpen(false);
          }}
          onOpenTracker={() => {
            setCartOpen(false);
            setTrackerOpen(true);
          }}
          onCloseTracker={() => setTrackerOpen(false)}
          onQuantity={(line, next) => setQuantity(line.item, line.variantLabel, next)}
          onCustomer={setCustomer}
          onNote={setNote}
          onEditIdentity={() => {
            if (identityLocked) return;
            setEditingIdentity(true);
          }}
          onSaveIdentity={saveIdentity}
          onCancelIdentity={() => {
            setCustomer(savedCustomer);
            setEditingIdentity(false);
          }}
          onSend={() => void send()}
        />
      ) : null}
    </PlateContext.Provider>
  );
}
