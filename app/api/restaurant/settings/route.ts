import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { getDbUserIdFromRequest } from "@/lib/authHelper";
import { allows, requireWritable } from "@/lib/billing/guard";
import { prisma } from "@/lib/prisma";
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
    select: { id: true, settings: true, name: true },
  });
}

export async function GET(request: Request) {
  try {
    const userId = await getDbUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const restaurant = await loadOwned(userId);
    if (!restaurant) {
      return NextResponse.json({ error: "Create your restaurant profile first." }, { status: 400 });
    }

    const settings = getRestaurantSettings(restaurant.settings);
    const digitalBillAllowed = await allows(userId, "restaurant.orders.digital_bill");

    return NextResponse.json({
      success: true,
      settings: {
        ...settings,
        // Force off visually when plan does not allow
        digitalBill: digitalBillAllowed ? settings.digitalBill : false,
      },
      entitlements: {
        digitalBill: digitalBillAllowed,
      },
    });
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

    const next = mergeRestaurantSettings(restaurant.settings, patch);
    await prisma.restaurant.update({
      where: { id: restaurant.id },
      data: { settings: next as Prisma.InputJsonValue },
    });

    const digitalBillAllowed = await allows(userId, "restaurant.orders.digital_bill");
    return NextResponse.json({
      success: true,
      settings: {
        ...getRestaurantSettings(next),
        digitalBill: digitalBillAllowed ? getRestaurantSettings(next).digitalBill : false,
      },
      entitlements: { digitalBill: digitalBillAllowed },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
