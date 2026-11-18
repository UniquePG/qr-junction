import { NextResponse } from "next/server";
import { getDbUserIdFromRequest } from "@/lib/authHelper";
import { RestaurantAccessError } from "@/lib/restaurant/access";
import { deleteRole, updateRole } from "@/lib/restaurant/staff/service";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

function errorResponse(error: unknown) {
  if (error instanceof RestaurantAccessError) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
  }
  console.error(error);
  return NextResponse.json({ error: "Could not manage role." }, { status: 500 });
}

export async function PATCH(request: Request, { params }: Params) {
  const userId = await getDbUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const roleId = Number(id);
  if (!Number.isInteger(roleId) || roleId <= 0) {
    return NextResponse.json({ error: "Invalid role id." }, { status: 400 });
  }
  const body = await request.json().catch(() => ({}));
  try {
    return NextResponse.json(
      await updateRole(
        userId,
        roleId,
        {
          name: body.name,
          description: body.description,
          permissions: body.permissions,
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
  const roleId = Number(id);
  if (!Number.isInteger(roleId) || roleId <= 0) {
    return NextResponse.json({ error: "Invalid role id." }, { status: 400 });
  }
  try {
    return NextResponse.json(await deleteRole(userId, roleId, request));
  } catch (error) {
    return errorResponse(error);
  }
}
