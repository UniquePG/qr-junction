import { NextResponse } from "next/server";
import { getDbUserIdFromRequest } from "@/lib/authHelper";
import { PlanLimitError } from "@/lib/billing/errors";
import { RestaurantAccessError } from "@/lib/restaurant/access";
import { removeStaff, updateStaff } from "@/lib/restaurant/staff/service";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

function errorResponse(error: unknown) {
  if (error instanceof RestaurantAccessError) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
  }
  if (error instanceof PlanLimitError) {
    return NextResponse.json({ error: error.message, code: "PLAN_LIMIT", feature: error.feature }, { status: 402 });
  }
  console.error(error);
  return NextResponse.json({ error: "Could not update staff." }, { status: 500 });
}

export async function PATCH(request: Request, { params }: Params) {
  const userId = await getDbUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const staffId = Number(id);
  if (!Number.isInteger(staffId) || staffId <= 0) {
    return NextResponse.json({ error: "Invalid staff id." }, { status: 400 });
  }
  const body = await request.json().catch(() => ({}));
  try {
    return NextResponse.json(
      await updateStaff(
        userId,
        staffId,
        {
          name: body.name,
          phone: body.phone,
          roleId: body.roleId != null ? Number(body.roleId) : undefined,
          avatarUrl: body.avatarUrl,
          joinedAt: body.joinedAt,
          status: body.status === "ACTIVE" || body.status === "DISABLED" ? body.status : undefined,
          password: body.password ? String(body.password) : undefined,
        },
        request,
      ),
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const userId = await getDbUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const staffId = Number(id);
  if (!Number.isInteger(staffId) || staffId <= 0) {
    return NextResponse.json({ error: "Invalid staff id." }, { status: 400 });
  }
  try {
    return NextResponse.json(await removeStaff(userId, staffId, request));
  } catch (error) {
    return errorResponse(error);
  }
}
