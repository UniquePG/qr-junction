import { NextResponse } from "next/server";
import { getDbUserIdFromRequest } from "@/lib/authHelper";
import { RestaurantAccessError } from "@/lib/restaurant/access";
import { listAuditLogs } from "@/lib/restaurant/staff/service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const userId = await getDbUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  try {
    return NextResponse.json(
      await listAuditLogs(userId, {
        page: Number(url.searchParams.get("page") || 1),
        pageSize: Number(url.searchParams.get("pageSize") || 25),
        action: url.searchParams.get("action") || undefined,
        category: url.searchParams.get("category") || undefined,
        actorKind: url.searchParams.get("actorKind") || undefined,
        q: url.searchParams.get("q") || undefined,
        dayStart: url.searchParams.get("dayStart") || undefined,
        meta: url.searchParams.get("meta") === "1",
        actorUserId: url.searchParams.get("actorUserId")
          ? Number(url.searchParams.get("actorUserId"))
          : undefined,
        from: url.searchParams.get("from") || undefined,
        to: url.searchParams.get("to") || undefined,
      }),
    );
  } catch (error) {
    if (error instanceof RestaurantAccessError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    }
    console.error(error);
    return NextResponse.json({ error: "Could not load logs." }, { status: 500 });
  }
}
