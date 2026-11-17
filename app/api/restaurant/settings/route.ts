import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { getDbUserIdFromRequest } from "@/lib/authHelper";
import { allows, requireWritable } from "@/lib/billing/guard";
import { prisma } from "@/lib/prisma";
import { resolveCallWaiterGate, resolveOrderingGate } from "@/lib/restaurant/gates";
import {
  getRestaurantSettings,
  isKnownSettingsKey,
  mergeRestaurantSettings,
  type RestaurantSettings,
} from "@/lib/restaurant/settings";

export const dynamic = "force-dynamic";

async function loadOwned(userId: number) {
  return prisma.restaurant.findUnique({
    where: { userId },
    select: {
      id: true,
      settings: true,
      name: true,
      orderingEnabled: true,
      callWaiterEnabled: true,
    },
  });
}

async function buildSettingsPayload(
  userId: number,
  restaurant: {
    id: number;
    settings: unknown;
    orderingEnabled: boolean;
    callWaiterEnabled: boolean;
  },
) {
  const settings = getRestaurantSettings(restaurant.settings);
  const digitalBillAllowed = await allows(userId, "restaurant.orders.digital_bill");
  const orderingGate = await resolveOrderingGate({
    userId,
    orderingEnabled: restaurant.orderingEnabled,
    settings: restaurant.settings,
  });
  const callWaiterGate = await resolveCallWaiterGate({
    userId,
    callWaiterEnabled: restaurant.callWaiterEnabled,
    settings: restaurant.settings,
  });

  return {
    success: true as const,
    settings: {
      ...settings,
      digitalBill: digitalBillAllowed ? settings.digitalBill : false,
      acceptingOrders: orderingGate.canManageAcceptingOrders ? settings.acceptingOrders : false,
      callWaiter: callWaiterGate.canManageCallWaiter ? settings.callWaiter : false,
    },
    entitlements: {
      digitalBill: digitalBillAllowed,
      ordering: orderingGate.planAllows,
      callWaiter: callWaiterGate.planAllows,
    },
    capabilities: {
      orderingUnlocked: orderingGate.unlocked,
      canManageAcceptingOrders: orderingGate.canManageAcceptingOrders,
      orderingEffective: orderingGate.effective,
      orderingReason: orderingGate.reason,
      callWaiterUnlocked: callWaiterGate.unlocked,
      canManageCallWaiter: callWaiterGate.canManageCallWaiter,
      callWaiterEffective: callWaiterGate.effective,
      callWaiterReason: callWaiterGate.reason,
    },
  };
}

export async function GET(request: Request) {
  try {
    const userId = await getDbUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const restaurant = await loadOwned(userId);
    if (!restaurant) {
      return NextResponse.json({ error: "Create your restaurant profile first." }, { status: 400 });
    }

    const { cacheGetJson, cacheSetJson } = await import("@/lib/cache/redis");
    const { restaurantCacheKey, TTL } = await import("@/lib/cache/keys");
    const cacheKey = restaurantCacheKey(restaurant.id, "settings");
    const cached = await cacheGetJson<Awaited<ReturnType<typeof buildSettingsPayload>>>(cacheKey);
    if (cached) return NextResponse.json(cached);

    const payload = await buildSettingsPayload(userId, restaurant);
    await cacheSetJson(cacheKey, payload, TTL.settings);
    return NextResponse.json(payload);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = await getDbUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await requireWritable(userId);

    const restaurant = await loadOwned(userId);
    if (!restaurant) {
      return NextResponse.json({ error: "Create your restaurant profile first." }, { status: 400 });
    }

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const patch: Partial<RestaurantSettings> = {};
    for (const [key, value] of Object.entries(body)) {
      if (!isKnownSettingsKey(key)) {
        return NextResponse.json({ error: `Unknown setting: ${key}` }, { status: 400 });
      }
      if (typeof value !== "boolean") {
        return NextResponse.json({ error: `${key} must be a boolean.` }, { status: 400 });
      }
      patch[key] = value;
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
    }

    if (patch.digitalBill === true) {
      const allowed = await allows(userId, "restaurant.orders.digital_bill");
      if (!allowed) {
        return NextResponse.json(
          { error: "Digital bills require the Growth plan.", code: "PLAN_REQUIRED" },
          { status: 403 },
        );
      }
    }

    if (typeof patch.acceptingOrders === "boolean") {
      const orderingGate = await resolveOrderingGate({
        userId,
        orderingEnabled: restaurant.orderingEnabled,
        settings: restaurant.settings,
      });
      if (!orderingGate.canManageAcceptingOrders) {
        return NextResponse.json(
          {
            error: "Ordering is not unlocked for this restaurant yet.",
            code: "ORDERING_LOCKED",
          },
          { status: 403 },
        );
      }
    }

    if (typeof patch.callWaiter === "boolean") {
      const callWaiterGate = await resolveCallWaiterGate({
        userId,
        callWaiterEnabled: restaurant.callWaiterEnabled,
        settings: restaurant.settings,
      });
      if (!callWaiterGate.canManageCallWaiter) {
        return NextResponse.json(
          {
            error: "Call waiter is not unlocked for this restaurant yet.",
            code: "CALL_WAITER_LOCKED",
          },
          { status: 403 },
        );
      }
    }

    const next = mergeRestaurantSettings(restaurant.settings, patch);
    await prisma.restaurant.update({
      where: { id: restaurant.id },
      data: { settings: next as Prisma.InputJsonValue },
    });

    const { invalidateRestaurant } = await import("@/lib/cache/invalidate");
    await invalidateRestaurant(restaurant.id, { settings: true, ordersActive: true, overview: true });

    const payload = await buildSettingsPayload(userId, {
      id: restaurant.id,
      settings: next,
      orderingEnabled: restaurant.orderingEnabled,
      callWaiterEnabled: restaurant.callWaiterEnabled,
    });
    return NextResponse.json(payload);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
