import { NextResponse } from "next/server";
import { getDbUserIdFromRequest } from "@/lib/authHelper";
import { listFinishedOrders, listRestaurantOrders, OrderError, setPrepMinutes } from "@/lib/orders/service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const userId = await getDbUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const url = new URL(request.url);
    if (url.searchParams.get("view") === "finished") {
      const data = await listFinishedOrders(userId, {
        q: url.searchParams.get("q") || "",
        from: url.searchParams.get("from") || "",
        to: url.searchParams.get("to") || "",
        status: url.searchParams.get("status") || "",
        place: url.searchParams.get("place") || "",
        page: Number(url.searchParams.get("page") || 1),
        pageSize: Number(url.searchParams.get("pageSize") || 12),
      });
      return NextResponse.json(data);
    }
    const data = await listRestaurantOrders(userId);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    }
    console.error(error);
    return NextResponse.json({ error: "Could not load orders." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const userId = await getDbUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  try {
    const result = await setPrepMinutes(userId, Number(body.prepMinutes));
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    }
    console.error(error);
    return NextResponse.json({ error: "Could not save the kitchen time." }, { status: 500 });
  }
}
