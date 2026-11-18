import { publishOrder, restaurantChannel } from "@/lib/orders/bus";
import { prisma } from "@/lib/prisma";
import { resolveCallWaiterGate } from "@/lib/restaurant/gates";
import {
  WAITER_COOLDOWN_SECONDS,
  WAITER_MAX_PENDING_PER_RESTAURANT,
  isWaiterReason,
  type WaiterReason,
} from "@/lib/waiter/types";

export class WaiterError extends Error {
  code: string;
  status: number;
  cooldownSeconds?: number;
  requestId?: number;

  constructor(
    message: string,
    code: string,
    status: number,
    extra?: { cooldownSeconds?: number; requestId?: number },
  ) {
    super(message);
    this.code = code;
    this.status = status;
    this.cooldownSeconds = extra?.cooldownSeconds;
    this.requestId = extra?.requestId;
  }
}

export type WaiterRequestDto = {
  id: number;
  restaurantId: number;
  tableNumber: string;
  reason: WaiterReason;
  status: string;
  createdAt: string;
  acknowledgedAt: string | null;
};

function toDto(row: {
  id: number;
  restaurantId: number;
  tableNumber: string;
  reason: string;
  status: string;
  createdAt: Date;
  acknowledgedAt: Date | null;
}): WaiterRequestDto {
  return {
    id: row.id,
    restaurantId: row.restaurantId,
    tableNumber: row.tableNumber,
    reason: row.reason as WaiterReason,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    acknowledgedAt: row.acknowledgedAt ? row.acknowledgedAt.toISOString() : null,
  };
}

export async function pendingWaiterCount(restaurantId: number) {
  return prisma.waiterRequest.count({
    where: { restaurantId, status: "PENDING" },
  });
}

function broadcast(
  type: "waiter.request.created" | "waiter.request.updated",
  request: WaiterRequestDto,
  waiterPendingCount: number,
) {
  publishOrder(restaurantChannel(request.restaurantId), {
    type,
    request,
    waiterPendingCount,
  });
}

function normalizeTableNumber(raw: unknown) {
  const value = String(raw ?? "").trim();
  if (!value) return null;
  if (value.length > 64) return null;
  return value;
}

function cooldownRemainingSeconds(createdAt: Date, now = Date.now()) {
  const elapsed = Math.floor((now - createdAt.getTime()) / 1000);
  return Math.max(0, WAITER_COOLDOWN_SECONDS - elapsed);
}

export async function createWaiterRequest(input: {
  restaurantId: number;
  tableNumber: unknown;
  reason: unknown;
  guestKey?: string | null;
}) {
  const restaurantId = Number(input.restaurantId);
  if (!Number.isInteger(restaurantId) || restaurantId <= 0) {
    throw new WaiterError("Restaurant not found.", "NOT_FOUND", 404);
  }

  const tableNumber = normalizeTableNumber(input.tableNumber);
  if (!tableNumber) {
    throw new WaiterError("Table is required.", "TABLE_REQUIRED", 400);
  }

  if (!isWaiterReason(input.reason)) {
    throw new WaiterError("Pick a valid reason.", "INVALID_REASON", 400);
  }
  const reason = input.reason;

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: {
      id: true,
      userId: true,
      callWaiterEnabled: true,
      settings: true,
    },
  });
  if (!restaurant) {
    throw new WaiterError("Restaurant not found.", "NOT_FOUND", 404);
  }

  const gate = await resolveCallWaiterGate({
    userId: restaurant.userId,
    callWaiterEnabled: restaurant.callWaiterEnabled,
    settings: restaurant.settings,
  });
  if (!gate.effective) {
    throw new WaiterError("Call waiter is not available.", "CALL_WAITER_OFF", 403);
  }

  const since = new Date(Date.now() - WAITER_COOLDOWN_SECONDS * 1000);
  const recent = await prisma.waiterRequest.findFirst({
    where: {
      restaurantId,
      tableNumber,
      createdAt: { gt: since },
    },
    orderBy: { createdAt: "desc" },
  });
  if (recent) {
    const remaining = cooldownRemainingSeconds(recent.createdAt);
    throw new WaiterError(
      remaining > 0
        ? `Please wait ${remaining}s before calling again.`
        : "Please wait before calling again.",
      "COOLDOWN",
      429,
      { cooldownSeconds: remaining || WAITER_COOLDOWN_SECONDS, requestId: recent.id },
    );
  }

  const openForTable = await prisma.waiterRequest.findFirst({
    where: { restaurantId, tableNumber, status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });
  if (openForTable) {
    throw new WaiterError("A waiter is already on the way for this table.", "PENDING_EXISTS", 409, {
      requestId: openForTable.id,
      cooldownSeconds: cooldownRemainingSeconds(openForTable.createdAt) || WAITER_COOLDOWN_SECONDS,
    });
  }

  const pendingCount = await pendingWaiterCount(restaurantId);
  if (pendingCount >= WAITER_MAX_PENDING_PER_RESTAURANT) {
    throw new WaiterError(
      "The restaurant is handling other requests. Try again shortly.",
      "QUEUE_FULL",
      429,
      { cooldownSeconds: 30 },
    );
  }

  const guestKey =
    typeof input.guestKey === "string" && input.guestKey.trim().length <= 64
      ? input.guestKey.trim()
      : null;

  const created = await prisma.waiterRequest.create({
    data: {
      restaurantId,
      tableNumber,
      reason,
      status: "PENDING",
      guestKey,
    },
  });

  const dto = toDto(created);
  const nextPending = await pendingWaiterCount(restaurantId);
  broadcast("waiter.request.created", dto, nextPending);

  return {
    request: dto,
    cooldownSeconds: WAITER_COOLDOWN_SECONDS,
    pendingCount: nextPending,
  };
}

export async function listPendingWaiterRequests(restaurantId: number) {
  const rows = await prisma.waiterRequest.findMany({
    where: { restaurantId, status: "PENDING" },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return {
    requests: rows.map(toDto),
    pendingCount: rows.length,
  };
}

export async function acknowledgeWaiterRequest(input: {
  restaurantId: number;
  requestId: number;
  actorUserId?: number | null;
}) {
  const existing = await prisma.waiterRequest.findFirst({
    where: { id: input.requestId, restaurantId: input.restaurantId },
  });
  if (!existing) {
    throw new WaiterError("Request not found.", "NOT_FOUND", 404);
  }
  if (existing.status !== "PENDING") {
    const pendingCount = await pendingWaiterCount(input.restaurantId);
    return { request: toDto(existing), changed: false, pendingCount };
  }

  const updated = await prisma.waiterRequest.update({
    where: { id: existing.id },
    data: {
      status: "ACKNOWLEDGED",
      acknowledgedAt: new Date(),
      acknowledgedByUserId: input.actorUserId ?? null,
    },
  });

  const dto = toDto(updated);
  const pendingCount = await pendingWaiterCount(input.restaurantId);
  broadcast("waiter.request.updated", dto, pendingCount);
  return { request: dto, changed: true, pendingCount };
}
