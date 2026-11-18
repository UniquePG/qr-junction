import { NextResponse } from "next/server";
import { requireWritable } from "@/lib/billing/guard";
import { auditFromContext } from "@/lib/restaurant/audit";
import { restaurantAuth, restaurantErrorResponse } from "@/lib/restaurant/http";
import { acknowledgeWaiterRequest, WaiterError } from "@/lib/waiter/service";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await restaurantAuth(request, "waiter.ack");
    if (auth.error) return auth.error;
    const { ctx } = auth;
    await requireWritable(ctx.ownerUserId);

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
      restaurantId: ctx.restaurant.id,
      requestId,
      actorUserId: ctx.actorUserId,
    });
    if (result.changed) {
      auditFromContext(ctx, {
        action: "waiter.ack",
        resourceType: "waiter_request",
        resourceId: requestId,
        summary: `Acknowledged waiter call #${requestId}`,
      });
    }
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    if (error instanceof WaiterError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      );
    }
    return restaurantErrorResponse(error, "Internal Server Error");
  }
}
