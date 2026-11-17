import { NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/auth/rateLimit";
import { createWaiterRequest, WaiterError } from "@/lib/waiter/service";

export const dynamic = "force-dynamic";

function fail(error: unknown) {
  if (error instanceof WaiterError) {
    const headers = new Headers();
    if (error.status === 429 && error.cooldownSeconds) {
      headers.set("Retry-After", String(error.cooldownSeconds));
    }
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        cooldownSeconds: error.cooldownSeconds ?? null,
        requestId: error.requestId ?? null,
      },
      { status: error.status, headers },
    );
  }
  console.error(error);
  return NextResponse.json({ error: "Could not call the waiter." }, { status: 500 });
}

export async function POST(request: Request) {
  try {
    const ip = clientIp(request);
    const limited = rateLimit(`waiter-create:${ip}`, 10, 60 * 1000);
    if (!limited.allowed) {
      return NextResponse.json(
        {
          error: "Too many requests. Please try again shortly.",
          code: "RATE_LIMIT",
          cooldownSeconds: limited.retryAfterSec,
        },
        {
          status: 429,
          headers: { "Retry-After": String(limited.retryAfterSec) },
        },
      );
    }

    const body = await request.json().catch(() => ({}));
    const result = await createWaiterRequest({
      restaurantId: Number(body.restaurantId),
      tableNumber: body.tableNumber,
      reason: body.reason,
      guestKey: body.guestKey ?? null,
    });
    return NextResponse.json(result);
  } catch (error) {
    return fail(error);
  }
}
