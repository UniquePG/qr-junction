import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhook } from "@/lib/billing/razorpay";

export async function POST(request: Request) {
  const raw = await request.text();
  if (!verifyWebhook(raw, request.headers.get("x-razorpay-signature"))) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const eventId = request.headers.get("x-razorpay-event-id") || "";
  if (!eventId) return NextResponse.json({ error: "Missing event id." }, { status: 400 });
  const existing = await prisma.billingEvent.findUnique({
    where: { provider_providerEventId: { provider: "razorpay", providerEventId: eventId } },
  });
  if (existing) return NextResponse.json({ ok: true });

  let body: { event?: string; payload?: { subscription?: { entity?: Record<string, any> } } };
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const entity = body?.payload?.subscription?.entity;
  const providerSubscriptionId = typeof entity?.id === "string" ? entity.id : "";
  if (!entity || !providerSubscriptionId) return NextResponse.json({ ok: true });

  const subscription = await prisma.subscription.findUnique({ where: { providerSubscriptionId } });
  if (!subscription) return NextResponse.json({ ok: true });

  const event = String(body.event || "");
  const currentEnd = entity.current_end ? new Date(Number(entity.current_end) * 1000) : subscription.currentPeriodEnd;
  const graceDays = Math.max(0, subscription.graceDays ?? 7);
  const grace = new Date(Date.now() + graceDays * 24 * 60 * 60 * 1000);

  if (event === "subscription.activated" || event === "subscription.charged" || event === "subscription.resumed") {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: "ACTIVE",
        currentPeriodEnd: currentEnd,
        graceUntil: null,
        providerCustomerId: entity.customer_id || subscription.providerCustomerId,
      },
    });
  } else if (event === "subscription.pending" || event === "subscription.halted") {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: "PAST_DUE", graceUntil: grace },
    });
  } else if (event === "subscription.cancelled" || event === "subscription.completed") {
    const graceUntil = currentEnd && currentEnd > new Date() ? new Date(currentEnd.getTime() + graceDays * 24 * 60 * 60 * 1000) : grace;
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: "CANCELED", currentPeriodEnd: currentEnd, graceUntil, cancelAtPeriodEnd: false },
    });
  }

  await prisma.subscriptionEvent.create({
    data: {
      subscriptionId: subscription.id,
      type: event || "razorpay_event",
      payload: { providerSubscriptionId, status: entity.status || null },
    },
  });
  await prisma.billingEvent.create({
    data: {
      provider: "razorpay",
      providerEventId: eventId,
      payload: body,
      processedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true });
}
