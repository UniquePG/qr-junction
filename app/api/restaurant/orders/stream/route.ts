import { NextResponse } from "next/server";
import { getDbUserIdFromRequest } from "@/lib/authHelper";
import { restaurantChannel } from "@/lib/orders/bus";
import { orderEventStream } from "@/lib/orders/stream";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const userId = await getDbUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const restaurant = await prisma.restaurant.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!restaurant) return NextResponse.json({ error: "Restaurant not found." }, { status: 404 });
  return orderEventStream(restaurantChannel(restaurant.id), request.signal);
}
