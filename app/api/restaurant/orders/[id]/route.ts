import { NextResponse } from "next/server";
import { getDbUserIdFromRequest } from "@/lib/authHelper";
import { getRestaurantOrder, OrderError, setOrderPaid, setOrderReadyIn, setOrderStageDue, transitionOrder } from "@/lib/orders/service";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/orders/status";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const userId = await getDbUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    const order = await getRestaurantOrder(userId, id);
    return NextResponse.json({ order });
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error(error);
    return NextResponse.json({ error: "Could not load this order." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const userId = await getDbUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const hasReadyIn = body.readyInMinutes !== undefined && body.readyInMinutes !== null && body.readyInMinutes !== "";
  const hasStage = body.stageMinutes !== undefined && body.stageMinutes !== null && body.stageMinutes !== "";
  const hasPaid = typeof body.paid === "boolean";
  const status = String(body.status || "").toUpperCase();
  const hasStatus = ORDER_STATUSES.includes(status as OrderStatus);
  if (!hasReadyIn && !hasStage && !hasPaid && !hasStatus) {
    return NextResponse.json({ error: "Unknown status." }, { status: 400 });
  }
  try {
    if (hasPaid) {
      const paid = await setOrderPaid(userId, id, body.paid);
      if (!hasStatus && !hasReadyIn && !hasStage) return NextResponse.json(paid);
    }
    if (hasStage) {
      const staged = await setOrderStageDue(userId, id, Number(body.stageMinutes));
      if (!hasStatus && !hasReadyIn) return NextResponse.json(staged);
    }
    if (hasReadyIn) {
      const timed = await setOrderReadyIn(userId, id, Number(body.readyInMinutes));
      if (!hasStatus) return NextResponse.json(timed);
    }
    const result = await transitionOrder(userId, id, status as OrderStatus, body.reason);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error(error);
    return NextResponse.json({ error: "Could not update this order." }, { status: 500 });
  }
}
