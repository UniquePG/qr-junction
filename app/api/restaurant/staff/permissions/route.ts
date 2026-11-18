import { NextResponse } from "next/server";
import { getDbUserIdFromRequest } from "@/lib/authHelper";
import { RestaurantAccessError, requireRestaurantContext, requireRestaurantPermission } from "@/lib/restaurant/access";
import {
  hasPermission,
  listPermissionGroups,
  ROLE_TEMPLATES,
  type StaffPermissionKey,
} from "@/lib/restaurant/staff/permissions";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const userId = await getDbUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const ctx = await requireRestaurantContext(userId);
    requireRestaurantPermission(ctx, "roles.manage");
    // Staff can only hand out access they hold themselves (the owner can grant everything).
    const holds = (key: string) => ctx.permissions === "ALL" || hasPermission(ctx.permissions, key as StaffPermissionKey);
    const groups = listPermissionGroups({ includeOwnerOnly: false })
      .map((g) => ({ ...g, permissions: g.permissions.filter((p) => holds(p.key)) }))
      .filter((g) => g.permissions.length > 0);
    const templates = ROLE_TEMPLATES.map((t) => ({ ...t, permissions: t.permissions.filter(holds) }));
    return NextResponse.json({ groups, templates });
  } catch (error) {
    if (error instanceof RestaurantAccessError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    }
    console.error(error);
    return NextResponse.json({ error: "Could not load permissions." }, { status: 500 });
  }
}
