import { NextResponse } from "next/server";
import { restaurantChannel } from "@/lib/orders/bus";
import { orderEventStream } from "@/lib/orders/stream";
import { restaurantAuth } from "@/lib/restaurant/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await restaurantAuth(request, ["orders.view", "waiter.view"]);
  if (auth.error) return auth.error;
  return orderEventStream(restaurantChannel(auth.ctx.restaurant.id), request.signal);
}
