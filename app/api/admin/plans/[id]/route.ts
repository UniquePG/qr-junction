import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { forbidden, requireAdmin } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { configForFeature } from "@/lib/billing/config";
import { asHighlights } from "@/lib/billing/present";
import { parseRupees } from "@/lib/billing/money";

type LimitInput = {
  featureKey?: string;
  enabled?: boolean;
  quota?: number;
  allowlist?: string[];
  config?: unknown;
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin(request);
  if (!admin) return forbidden();
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const plan = await prisma.plan.findUnique({ where: { id }, include: { _count: { select: { subscriptions: true } } } });
  if (!plan) return NextResponse.json({ error: "Plan not found." }, { status: 404 });

  if (body.active === false && plan._count.subscriptions > 0 && body.forceDelete) {
    return NextResponse.json({ error: "Deactivate this plan instead of deleting it." }, { status: 400 });
  }

  await prisma.plan.update({
    where: { id },
    data: {
      name: typeof body.name === "string" ? body.name.trim() : undefined,
      monthlyPricePaise: parseRupees(body.monthlyRupees) ?? (Number.isFinite(Number(body.monthlyPricePaise)) && body.monthlyPricePaise !== undefined ? Number(body.monthlyPricePaise) : undefined),
      yearlyPricePaise: parseRupees(body.yearlyRupees) ?? (Number.isFinite(Number(body.yearlyPricePaise)) && body.yearlyPricePaise !== undefined ? Number(body.yearlyPricePaise) : undefined),
      graceDays: Number.isFinite(Number(body.graceDays)) ? Math.max(0, Math.min(60, Math.round(Number(body.graceDays)))) : undefined,
      isPublic: typeof body.isPublic === "boolean" ? body.isPublic : undefined,
      active: typeof body.active === "boolean" ? body.active : undefined,
      sortOrder: Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : undefined,
      highlights: Array.isArray(body.highlights) ? asHighlights(body.highlights) : undefined,
    },
  });

  const limits = Array.isArray(body.limits) ? (body.limits as LimitInput[]) : [];
  for (const limit of limits) {
    if (!limit.featureKey) continue;
    const allowlist = Array.isArray(limit.allowlist)
      ? limit.allowlist.map((item) => String(item).trim()).filter(Boolean)
      : undefined;
    const config = "config" in limit ? configForFeature(limit.featureKey, limit.config) : undefined;
    await prisma.planLimit.update({
      where: { planId_featureKey: { planId: id, featureKey: limit.featureKey } },
      data: {
        enabled: typeof limit.enabled === "boolean" ? limit.enabled : undefined,
        quota: Number.isFinite(Number(limit.quota)) ? Number(limit.quota) : undefined,
        allowlist: allowlist as Prisma.InputJsonValue | undefined,
        config: config === undefined ? undefined : config ?? Prisma.DbNull,
      },
    }).catch(() => null);
  }

  const saved = await prisma.plan.findUnique({ where: { id }, include: { limits: true } });
  return NextResponse.json({ plan: saved });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin(request);
  if (!admin) return forbidden();
  const { id } = await params;
  const plan = await prisma.plan.findUnique({ where: { id }, include: { _count: { select: { subscriptions: true } } } });
  if (!plan) return NextResponse.json({ error: "Plan not found." }, { status: 404 });
  if (plan.code === "free" || plan.code === "legacy") {
    return NextResponse.json({ error: "Free and Legacy stay in the system. Hide a plan instead of deleting it." }, { status: 400 });
  }
  if (plan._count.subscriptions > 0) {
    return NextResponse.json({ error: "Move every account off this plan before deleting it." }, { status: 400 });
  }
  await prisma.plan.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
