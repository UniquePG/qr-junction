import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { allows, requireWritable } from "@/lib/billing/guard";
import { prisma } from "@/lib/prisma";
import { auditFromContext } from "@/lib/restaurant/audit";
import { resolveCallWaiterGate, resolveOrderingGate } from "@/lib/restaurant/gates";
import { restaurantAuth, restaurantErrorResponse } from "@/lib/restaurant/http";
import {
  getRestaurantSettings,
  isKnownSettingsKey,
  mergeRestaurantSettings,
  type RestaurantSettings,
} from "@/lib/restaurant/settings";

export const dynamic = "force-dynamic";

/** Day-to-day switches a floor manager can flip without full settings access. */
const OPERATIONS_KEYS = new Set(["acceptingOrders", "callWaiter"]);

async function buildSettingsPayload(
  ownerUserId: number,
  restaurant: {
    id: number;
    settings: unknown;
    orderingEnabled: boolean;
    callWaiterEnabled: boolean;
  },
) {
  const settings = getRestaurantSettings(restaurant.settings);
  const digitalBillAllowed = await allows(ownerUserId, "restaurant.orders.digital_bill");
  const orderingGate = await resolveOrderingGate({
    userId: ownerUserId,
    orderingEnabled: restaurant.orderingEnabled,
    settings: restaurant.settings,
  });
  const callWaiterGate = await resolveCallWaiterGate({
    userId: ownerUserId,
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
    const auth = await restaurantAuth(request, "settings.view");
    if (auth.error) return auth.error;
    const { ctx } = auth;
    const restaurant = {
      id: ctx.restaurant.id,
      settings: ctx.restaurant.settings,
      orderingEnabled: ctx.restaurant.orderingEnabled,
      callWaiterEnabled: ctx.restaurant.callWaiterEnabled,
    };

    const { cacheGetJson, cacheSetJson } = await import("@/lib/cache/redis");
    const { restaurantCacheKey, TTL } = await import("@/lib/cache/keys");
    const cacheKey = restaurantCacheKey(restaurant.id, "settings");
    const cached = await cacheGetJson<Awaited<ReturnType<typeof buildSettingsPayload>>>(cacheKey);
    if (cached) return NextResponse.json(cached);

    const payload = await buildSettingsPayload(ctx.ownerUserId, restaurant);
    await cacheSetJson(cacheKey, payload, TTL.settings);
    return NextResponse.json(payload);
  } catch (error) {
    return restaurantErrorResponse(error, "Internal Server Error");
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    // Pausing orders / call-waiter alone only needs `settings.operations`.
    const bodyKeys = Object.keys(body || {});
    const operationsOnly =
      bodyKeys.length > 0 && bodyKeys.every((key) => OPERATIONS_KEYS.has(key));
    const auth = await restaurantAuth(
      request,
      operationsOnly ? ["settings.update", "settings.operations"] : "settings.update",
    );
    if (auth.error) return auth.error;
    const { ctx } = auth;
    await requireWritable(ctx.ownerUserId);

    const restaurant = {
      id: ctx.restaurant.id,
      settings: ctx.restaurant.settings,
      orderingEnabled: ctx.restaurant.orderingEnabled,
      callWaiterEnabled: ctx.restaurant.callWaiterEnabled,
    };

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
      const allowed = await allows(ctx.ownerUserId, "restaurant.orders.digital_bill");
      if (!allowed) {
        return NextResponse.json(
          { error: "Digital bills require the Growth plan.", code: "PLAN_REQUIRED" },
          { status: 403 },
        );
      }
    }

    if (typeof patch.acceptingOrders === "boolean") {
      const orderingGate = await resolveOrderingGate({
        userId: ctx.ownerUserId,
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
        userId: ctx.ownerUserId,
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

    auditFromContext(ctx, {
      action: "settings.update",
      resourceType: "restaurant_settings",
      resourceId: restaurant.id,
      summary: `Updated settings: ${Object.entries(patch)
        .map(([key, value]) => `${key} ${value ? "on" : "off"}`)
        .join(", ")}`,
      meta: patch,
    });

    const payload = await buildSettingsPayload(ctx.ownerUserId, {
      id: restaurant.id,
      settings: next,
      orderingEnabled: restaurant.orderingEnabled,
      callWaiterEnabled: restaurant.callWaiterEnabled,
    });
    return NextResponse.json(payload);
  } catch (error) {
    return restaurantErrorResponse(error, "Internal Server Error");
  }
}
