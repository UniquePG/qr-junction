import { Server, type IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";
import { WebSocketServer, type RawData, type WebSocket } from "ws";
import { getDbUserIdFromIdToken } from "@/lib/authHelper";
import { orderChannel, restaurantChannel, subscribeOrder, type OrderBusEvent } from "@/lib/orders/bus";
import { prisma } from "@/lib/prisma";

type LiveSocket = WebSocket & { liveReady?: boolean };

const globalState = globalThis as typeof globalThis & { __qrLiveAttached?: boolean };

function send(socket: WebSocket, payload: unknown) {
  if (socket.readyState !== socket.OPEN) return;
  socket.send(JSON.stringify(payload));
}

function textOf(data: RawData) {
  if (typeof data === "string") return data;
  if (Buffer.isBuffer(data)) return data.toString("utf8");
  if (Array.isArray(data)) return Buffer.concat(data).toString("utf8");
  return Buffer.from(data).toString("utf8");
}

async function watchGuest(socket: LiveSocket, tokens: unknown, replace: (unsubscribe: () => void) => void) {
  const requested = Array.isArray(tokens) ? tokens.map((token) => String(token || "").trim()).filter((token) => token.length >= 16).slice(0, 20) : [];
  if (requested.length === 0) {
    replace(() => {});
    send(socket, { type: "ready" });
    return;
  }
  const rows = await prisma.menuOrder.findMany({
    where: { publicToken: { in: requested } },
    select: { publicToken: true },
  });
  const stops = rows.map((row) => subscribeOrder(orderChannel(row.publicToken), (event) => send(socket, event)));
  replace(() => {
    for (const stop of stops) stop();
  });
  send(socket, { type: "ready" });
}

async function watchKitchen(socket: LiveSocket, token: unknown, replace: (unsubscribe: () => void) => void) {
  const userId = await getDbUserIdFromIdToken(String(token || ""));
  if (!userId) {
    send(socket, { type: "error", message: "unauthorized" });
    socket.close();
    return;
  }
  const restaurant = await prisma.restaurant.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!restaurant) {
    send(socket, { type: "error", message: "Restaurant not found." });
    socket.close();
    return;
  }
  const stop = subscribeOrder(restaurantChannel(restaurant.id), (event: OrderBusEvent) => send(socket, event));
  replace(stop);
  const placedCount = await prisma.menuOrder.count({
    where: { restaurantId: restaurant.id, status: "PLACED" },
  });
  send(socket, { type: "ready", placedCount });
}

function handleConnection(socket: LiveSocket) {
  let role: "kitchen" | "guest" | null = null;
  let unsubscribe = () => {};
  let alive = true;
  const replace = (next: () => void) => {
    unsubscribe();
    unsubscribe = next;
  };
  const authTimer = setTimeout(() => {
    if (!role) socket.close();
  }, 8000);
  const ping = setInterval(() => {
    if (!alive) {
      socket.terminate();
      return;
    }
    alive = false;
    socket.ping();
  }, 25000);

  const close = () => {
    clearTimeout(authTimer);
    clearInterval(ping);
    unsubscribe();
    unsubscribe = () => {};
  };

  socket.on("pong", () => {
    alive = true;
  });
  socket.on("close", close);
  socket.on("error", close);
  socket.on("message", (data) => {
    const text = textOf(data);
    if (text.length > 12000) return;
    let message: { type?: string; token?: unknown; tokens?: unknown };
    try {
      message = JSON.parse(text);
    } catch {
      return;
    }
    if (message.type === "auth") {
      if (role === "guest") return;
      role = "kitchen";
      clearTimeout(authTimer);
      void watchKitchen(socket, message.token, replace);
      return;
    }
    if (message.type === "watch") {
      if (role === "kitchen") return;
      role = "guest";
      clearTimeout(authTimer);
      void watchGuest(socket, message.tokens, replace);
    }
  });
}

export function attachLiveSocket() {
  if (globalState.__qrLiveAttached) return;
  globalState.__qrLiveAttached = true;
  console.info("Live order socket attached at /live");

  const wss = new WebSocketServer({ noServer: true });
  wss.on("connection", (socket) => handleConnection(socket));

  const emit = Server.prototype.emit;
  Server.prototype.emit = function (this: Server, event: string, ...args: unknown[]) {
    if (event !== "upgrade") return emit.apply(this, [event, ...args] as never);
    const request = args[0] as IncomingMessage;
    const path = (request.url || "").split("?")[0];
    if (path !== "/live") return emit.apply(this, [event, ...args] as never);
    const socket = args[1] as Duplex;
    const head = args[2] as Buffer;
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
    return true;
  } as typeof Server.prototype.emit;
}
