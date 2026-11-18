import { NextResponse } from "next/server";
import { restaurantAuth, restaurantErrorResponse } from "@/lib/restaurant/http";
import { listPendingWaiterRequests } from "@/lib/waiter/service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const auth = await restaurantAuth(request, "waiter.view");
    if (auth.error) return auth.error;

    const status = new URL(request.url).searchParams.get("status") || "PENDING";
    if (status !== "PENDING") {
      return NextResponse.json({ error: "Only PENDING status is supported." }, { status: 400 });
    }

    const result = await listPendingWaiterRequests(auth.ctx.restaurant.id);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return restaurantErrorResponse(error, "Internal Server Error");
  }
}
