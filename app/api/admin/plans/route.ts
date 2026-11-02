import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { forbidden, requireAdmin } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { FEATURE_ALLOWLISTS } from "@/lib/billing/allowlists";
import { parseRupees } from "@/lib/billing/money";
import { ensureCatalog } from "@/lib/billing/seed";

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return forbidden();
  await ensureCatalog();
  const [plans, features] = await Promise.all([
    prisma.plan.findMany({
      orderBy: { sortOrder: "asc" },
      include: { limits: true, _count: { select: { subscriptions: true } } },
    }),
    prisma.featureDefinition.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  return NextResponse.json({ plans, features, allowlists: FEATURE_ALLOWLISTS });
}

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return forbidden();
  await ensureCatalog();
  const body = await request.json().catch(() => ({}));
  const code = String(body.code || "").trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
  const name = String(body.name || "").trim();
  if (!code || !name) {
    return NextResponse.json({ error: "Code and name are required." }, { status: 400 });
  }
  const copyFrom = String(body.copyFrom || "free");
  const source = await prisma.plan.findUnique({ where: { code: copyFrom }, include: { limits: true } });
  if (!source) return NextResponse.json({ error: "Plan to copy was not found." }, { status: 400 });

  try {
    const plan = await prisma.plan.create({
      data: {
        code,
        name,
        scope: "ACCOUNT",
        monthlyPricePaise: parseRupees(body.monthlyRupees) ?? (Number(body.monthlyPricePaise) || 0),
        yearlyPricePaise: parseRupees(body.yearlyRupees) ?? (Number(body.yearlyPricePaise) || 0),
        graceDays: Number.isFinite(Number(body.graceDays)) ? Math.max(0, Math.min(60, Math.round(Number(body.graceDays)))) : 7,
        isPublic: Boolean(body.isPublic),
        active: true,
        sortOrder: Number(body.sortOrder) || 10,
        highlights: source.highlights ?? [],
        limits: {
          create: source.limits.map((limit) => ({
            featureKey: limit.featureKey,
            enabled: limit.enabled,
            quota: limit.quota,
            allowlist: limit.allowlist ?? [],
            config: limit.config ?? Prisma.DbNull,
          })),
        },
      },
    });
    return NextResponse.json({ plan });
  } catch {
    return NextResponse.json({ error: "That plan code already exists." }, { status: 409 });
  }
}
