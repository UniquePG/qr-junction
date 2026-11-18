import { NextResponse } from "next/server";
import { getDbUserIdFromRequest } from "@/lib/authHelper";
import { planErrorResponse } from "@/lib/billing/errors";
import {
  RestaurantAccessError,
  requireAnyRestaurantPermission,
  requireRestaurantContext,
  requireRestaurantPermission,
  type RestaurantContext,
} from "@/lib/restaurant/access";
import type { StaffPermissionKey } from "@/lib/restaurant/staff/permissions";

export async function restaurantAuth(
  request: Request,
  permission?: StaffPermissionKey | StaffPermissionKey[],
): Promise<{ ctx: RestaurantContext; error?: undefined } | { ctx?: undefined; error: NextResponse }> {
  const userId = await getDbUserIdFromRequest(request);
  if (!userId) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  try {
    const ctx = await requireRestaurantContext(userId);
    if (permission) {
      if (Array.isArray(permission)) requireAnyRestaurantPermission(ctx, permission);
      else requireRestaurantPermission(ctx, permission);
    }
    return { ctx };
  } catch (error) {
    if (error instanceof RestaurantAccessError) {
      return {
        error: NextResponse.json({ error: error.message, code: error.code }, { status: error.status }),
      };
    }
    throw error;
  }
}

export function restaurantErrorResponse(error: unknown, fallback = "Request failed.") {
  const plan = planErrorResponse(error);
  if (plan) return plan;
  if (error instanceof RestaurantAccessError) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
  }
  console.error(error);
  return NextResponse.json({ error: fallback }, { status: 500 });
}
