import { NextResponse } from "next/server";
import { getDbUserIdFromRequest } from "@/lib/authHelper";
import { PlanLimitError } from "@/lib/billing/errors";
import { RestaurantAccessError } from "@/lib/restaurant/access";
import { createStaff, listStaff } from "@/lib/restaurant/staff/service";

export const dynamic = "force-dynamic";

function errorResponse(error: unknown) {
  if (error instanceof RestaurantAccessError) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
  }
  if (error instanceof PlanLimitError) {
    return NextResponse.json({ error: error.message, code: "PLAN_LIMIT", feature: error.feature }, { status: 402 });
  }
  console.error(error);
  return NextResponse.json({ error: "Could not manage staff." }, { status: 500 });
}

export async function GET(request: Request) {
  const userId = await getDbUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return NextResponse.json(await listStaff(userId));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  const userId = await getDbUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  try {
    return NextResponse.json(
      await createStaff(
        userId,
        {
          name: String(body.name || ""),
          email: String(body.email || ""),
          phone: body.phone,
          password: String(body.password || ""),
          roleId: Number(body.roleId),
          avatarUrl: body.avatarUrl ?? null,
          joinedAt: body.joinedAt ?? null,
        },
        request,
      ),
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
