import { NextResponse } from "next/server";
import { getDbUserIdFromRequest } from "@/lib/authHelper";
import { RestaurantAccessError } from "@/lib/restaurant/access";
import { createRole, listRoles } from "@/lib/restaurant/staff/service";

export const dynamic = "force-dynamic";

function errorResponse(error: unknown) {
  if (error instanceof RestaurantAccessError) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
  }
  console.error(error);
  return NextResponse.json({ error: "Could not manage roles." }, { status: 500 });
}

export async function GET(request: Request) {
  const userId = await getDbUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return NextResponse.json(await listRoles(userId));
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
      await createRole(
        userId,
        {
          name: String(body.name || ""),
          description: body.description,
          permissions: body.permissions,
          templateId: body.templateId ? String(body.templateId) : undefined,
        },
        request,
      ),
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
