import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { forbidden, requireAdmin } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { ensureCatalog } from "@/lib/billing/seed";
import { parseRupees } from "@/lib/billing/money";
import { resolveBilling } from "@/lib/billing/resolve";

async function loadUser(id: string) {
  const userId = Number(id);
  if (!userId) return null;
  return prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin(request);
  if (!admin) return forbidden();
  const { id } = await params;
  const user = await loadUser(id);
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });
  await ensureCatalog();
  const plans = await prisma.plan.findMany({ where: { scope: "ACCOUNT", active: true }, orderBy: { sortOrder: "asc" } });
  const billing = await resolveBilling(user.id);
  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
    include: { overrides: { orderBy: { createdAt: "desc" } } },
  });
  return NextResponse.json({ plans, billing, subscription });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin(request);
  if (!admin) return forbidden();
  const { id } = await params;
  const user = await loadUser(id);
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });
  await ensureCatalog();
  const body = await request.json().catch(() => ({}));
  const plan = body.planCode
    ? await prisma.plan.findUnique({ where: { code: String(body.planCode) } })
    : null;
  if (body.planCode && !plan) return NextResponse.json({ error: "Plan not found." }, { status: 404 });

  const existing = await prisma.subscription.findUnique({ where: { userId: user.id } });
  const periodEnd = body.clearPeriodEnd
    ? null
    : body.currentPeriodEnd
      ? new Date(body.currentPeriodEnd)
      : undefined;
  const lockedFromRupees = parseRupees(body.lockedPriceRupees);
  const lockedPrice = body.clearLockedPrice
    ? null
    : lockedFromRupees !== undefined
      ? lockedFromRupees
      : body.lockedPricePaise !== undefined && body.lockedPricePaise !== "" && Number.isFinite(Number(body.lockedPricePaise))
        ? Number(body.lockedPricePaise)
        : undefined;
  const graceDays = Number.isFinite(Number(body.graceDays))
    ? Math.max(0, Math.min(60, Math.round(Number(body.graceDays))))
    : undefined;

  const subscription = existing
    ? await prisma.subscription.update({
        where: { id: existing.id },
        data: {
          planId: plan?.id,
          status: body.status || undefined,
          interval: body.interval === null ? null : body.interval || undefined,
          currentPeriodEnd: periodEnd,
          lockedPricePaise: lockedPrice,
          graceDays,
          source: "ADMIN",
        },
      })
    : await prisma.subscription.create({
        data: {
          userId: user.id,
          planId: plan?.id || (await prisma.plan.findUniqueOrThrow({ where: { code: "free" } })).id,
          status: body.status || "ACTIVE",
          source: "ADMIN",
          interval: body.interval || null,
          currentPeriodEnd: periodEnd ?? null,
          lockedPricePaise: lockedPrice ?? null,
          graceDays: graceDays ?? plan?.graceDays ?? 7,
        },
      });

  await prisma.subscriptionEvent.create({
    data: {
      subscriptionId: subscription.id,
      type: "admin_update",
      createdById: admin.id,
      payload: body as Prisma.InputJsonValue,
    },
  });

  return NextResponse.json({ subscription });
}
