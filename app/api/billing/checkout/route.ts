import { NextResponse } from "next/server";
import { getDbUserIdFromRequest } from "@/lib/authHelper";
import { prisma } from "@/lib/prisma";
import { ensureAccountSubscription } from "@/lib/billing/seed";
import { razorpayConfigured, razorpayPost } from "@/lib/billing/razorpay";

export async function POST(request: Request) {
  const userId = await getDbUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!razorpayConfigured()) {
    return NextResponse.json({ error: "Billing is not configured yet. An admin can still assign a plan." }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const interval = body.interval === "YEAR" ? "YEAR" : "MONTH";
  const plan = await prisma.plan.findFirst({
    where: { code: String(body.planCode || ""), isPublic: true, active: true, scope: "ACCOUNT" },
  });
  if (!plan || plan.code === "free" || plan.code === "legacy") {
    return NextResponse.json({ error: "Choose a paid plan." }, { status: 400 });
  }

  const subscription = await ensureAccountSubscription(userId);
  const full = await prisma.subscription.findUnique({ where: { id: subscription.id } });
  const amount = full?.lockedPricePaise && full.lockedPricePaise > 0
    ? full.lockedPricePaise
    : interval === "YEAR"
      ? plan.yearlyPricePaise
      : plan.monthlyPricePaise;
  if (!amount) return NextResponse.json({ error: "This plan has no price yet." }, { status: 400 });

  const providerPlan = await razorpayPost("/plans", {
    period: interval === "YEAR" ? "yearly" : "monthly",
    interval: 1,
    item: {
      name: `${plan.name} ${interval === "YEAR" ? "yearly" : "monthly"}`,
      amount,
      currency: "INR",
    },
  });
  const trialEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const providerSubscription = await razorpayPost("/subscriptions", {
    plan_id: providerPlan.id,
    total_count: interval === "YEAR" ? 10 : 120,
    customer_notify: 1,
    start_at: Math.floor(trialEnd.getTime() / 1000),
    notes: { userId: String(userId), planCode: plan.code },
  });

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      planId: plan.id,
      status: "TRIALING",
      source: "RAZORPAY",
      interval,
      currentPeriodStart: new Date(),
      currentPeriodEnd: trialEnd,
      cancelAtPeriodEnd: false,
      provider: "razorpay",
      providerSubscriptionId: providerSubscription.id,
    },
  });
  await prisma.subscriptionEvent.create({
    data: {
      subscriptionId: subscription.id,
      type: "checkout_started",
      payload: { planCode: plan.code, interval, providerSubscriptionId: providerSubscription.id },
    },
  });

  return NextResponse.json({ url: providerSubscription.short_url, subscriptionId: providerSubscription.id });
}
