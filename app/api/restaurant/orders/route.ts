import { NextResponse } from "next/server";
import { listFinishedOrders, listRestaurantOrders, OrderError, setPrepMinutes } from "@/lib/orders/service";
import { createTimer } from "@/lib/perf/timing";
import { auditFromContext } from "@/lib/restaurant/audit";
import { restaurantAuth, restaurantErrorResponse } from "@/lib/restaurant/http";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const timer = createTimer();
  const auth = await restaurantAuth(request, ["orders.view", "orders.pay"]);
  timer.mark("auth");
  if (auth.error) return auth.error;
  const { ctx } = auth;
  try {
    const url = new URL(request.url);
    if (url.searchParams.get("view") === "finished") {
      const data = await listFinishedOrders(ctx.restaurant.id, ctx.ownerUserId, {
        q: url.searchParams.get("q") || "",
        from: url.searchParams.get("from") || "",
        to: url.searchParams.get("to") || "",
        status: url.searchParams.get("status") || "",
        place: url.searchParams.get("place") || "",
        page: Number(url.searchParams.get("page") || 1),
        pageSize: Number(url.searchParams.get("pageSize") || 12),
      });
      timer.mark("db");
      const response = NextResponse.json(data);
      timer.apply(response);
      timer.log("GET /api/restaurant/orders?view=finished");
      return response;
    }
    const data = await listRestaurantOrders(ctx.restaurant.id, ctx.ownerUserId);
    timer.mark("db");
    const response = NextResponse.json(data);
    timer.apply(response);
    timer.log("GET /api/restaurant/orders");
    return response;
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    }
    return restaurantErrorResponse(error, "Could not load orders.");
  }
}

export async function PATCH(request: Request) {
  // Kitchen time is part of running the floor, so order handlers can set it too.
  const auth = await restaurantAuth(request, ["orders.update", "settings.update", "settings.operations"]);
  if (auth.error) return auth.error;
  const { ctx } = auth;
  const body = await request.json().catch(() => ({}));
  try {
    const result = await setPrepMinutes(ctx.restaurant.id, Number(body.prepMinutes));
    auditFromContext(ctx, {
      action: "settings.prep_minutes",
      resourceType: "restaurant",
      resourceId: ctx.restaurant.id,
      summary: `Set kitchen time to ${result.prepMinutes} min`,
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    }
    return restaurantErrorResponse(error, "Could not save the kitchen time.");
  }
}
