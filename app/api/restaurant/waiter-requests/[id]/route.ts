import { NextResponse } from "next/server";
import { getDbUserIdFromRequest } from "@/lib/authHelper";
import { requireWritable } from "@/lib/billing/guard";
import { prisma } from "@/lib/prisma";
import { acknowledgeWaiterRequest, WaiterError } from "@/lib/waiter/service";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getDbUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await requireWritable(userId);

    const restaurant = await prisma.restaurant.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!restaurant) {
      return NextResponse.json({ error: "Create your restaurant profile first." }, { status: 400 });
    }

    const { id } = await params;
    const requestId = Number(id);
    if (!Number.isInteger(requestId) || requestId <= 0) {
      return NextResponse.json({ error: "Invalid request id." }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    if (body.status !== "ACKNOWLEDGED") {
      return NextResponse.json({ error: "Only ACKNOWLEDGED is supported." }, { status: 400 });
    }

    const result = await acknowledgeWaiterRequest({
      restaurantId: restaurant.id,
      requestId,
    });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    if (error instanceof WaiterError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      );
    }
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
