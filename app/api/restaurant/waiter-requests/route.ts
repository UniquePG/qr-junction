import { NextResponse } from "next/server";
import { getDbUserIdFromRequest } from "@/lib/authHelper";
import { prisma } from "@/lib/prisma";
import { listPendingWaiterRequests } from "@/lib/waiter/service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const userId = await getDbUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const restaurant = await prisma.restaurant.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!restaurant) {
      return NextResponse.json({ error: "Create your restaurant profile first." }, { status: 400 });
    }

    const status = new URL(request.url).searchParams.get("status") || "PENDING";
    if (status !== "PENDING") {
      return NextResponse.json({ error: "Only PENDING status is supported." }, { status: 400 });
    }

    const result = await listPendingWaiterRequests(restaurant.id);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
