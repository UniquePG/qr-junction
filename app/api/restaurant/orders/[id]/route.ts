import { NextResponse } from "next/server";
import {
  getRestaurantOrder,
  OrderError,
  setOrderPaid,
  setOrderReadyIn,
  setOrderStageDue,
  transitionOrder,
} from "@/lib/orders/service";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/orders/status";
import { auditFromContext } from "@/lib/restaurant/audit";
import { restaurantAuth, restaurantErrorResponse } from "@/lib/restaurant/http";
import type { StaffPermissionKey } from "@/lib/restaurant/staff/permissions";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const auth = await restaurantAuth(request, "orders.view");
  if (auth.error) return auth.error;
  const { id } = await params;
  try {
    const order = await getRestaurantOrder(auth.ctx.restaurant.id, id);
    return NextResponse.json({ order });
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return restaurantErrorResponse(error, "Could not load this order.");
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const hasReadyIn = body.readyInMinutes !== undefined && body.readyInMinutes !== null && body.readyInMinutes !== "";
  const hasStage = body.stageMinutes !== undefined && body.stageMinutes !== null && body.stageMinutes !== "";
  const hasPaid = typeof body.paid === "boolean";
  const status = String(body.status || "").toUpperCase();
  const hasStatus = ORDER_STATUSES.includes(status as OrderStatus);

  let permission: StaffPermissionKey | StaffPermissionKey[] = "orders.update";
  if (hasPaid && !hasStatus && !hasReadyIn && !hasStage) permission = "orders.pay";
  else if (hasPaid) permission = ["orders.update", "orders.pay"];
  // Rejecting an order is a separate (destructive) permission.
  if (status === "REJECTED") permission = "orders.reject";

  const auth = await restaurantAuth(request, permission);
  if (auth.error) return auth.error;
  const { ctx } = auth;

  if (!hasReadyIn && !hasStage && !hasPaid && !hasStatus) {
    return NextResponse.json({ error: "Unknown status." }, { status: 400 });
  }
  try {
    if (hasPaid) {
      const paid = await setOrderPaid(ctx.restaurant.id, id, body.paid);
      auditFromContext(ctx, {
        action: body.paid ? "order.paid" : "order.unpaid",
        resourceType: "menu_order",
        resourceId: id,
        summary: body.paid ? `Marked order ${id} paid` : `Marked order ${id} unpaid`,
      });
      if (!hasStatus && !hasReadyIn && !hasStage) return NextResponse.json(paid);
    }
    if (hasStage) {
      const staged = await setOrderStageDue(ctx.restaurant.id, id, Number(body.stageMinutes));
      auditFromContext(ctx, {
        action: "order.stage",
        resourceType: "menu_order",
        resourceId: id,
        summary: `Set stage timer on order ${id}`,
        meta: { stageMinutes: Number(body.stageMinutes) },
      });
      if (!hasStatus && !hasReadyIn) return NextResponse.json(staged);
    }
    if (hasReadyIn) {
      const timed = await setOrderReadyIn(ctx.restaurant.id, id, Number(body.readyInMinutes));
      auditFromContext(ctx, {
        action: "order.ready_in",
        resourceType: "menu_order",
        resourceId: id,
        summary: `Set ready-in on order ${id}`,
        meta: { readyInMinutes: Number(body.readyInMinutes) },
      });
      if (!hasStatus) return NextResponse.json(timed);
    }
    const result = await transitionOrder(ctx.restaurant.id, id, status as OrderStatus, body.reason, ctx.actorUserId);
    if (result.changed) {
      auditFromContext(ctx, {
        action: "order.status",
        resourceType: "menu_order",
        resourceId: id,
        summary: `Moved order ${id} to ${status}`,
        meta: { status, reason: body.reason || null },
      });
    }
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return restaurantErrorResponse(error, "Could not update this order.");
  }
}
