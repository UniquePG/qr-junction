import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { forbidden, requireAdmin } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { ensureCatalog } from "@/lib/billing/seed";

const KINDS = ["BOOLEAN", "QUOTA", "MONTHLY", "LIFETIME", "ALLOWLIST"] as const;
const SUITES = ["platform", "restaurant", "reviews"] as const;

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return forbidden();
  await ensureCatalog();
  const body = await request.json().catch(() => ({}));
  const key = String(body.key || "").trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
  const label = String(body.label || "").trim();
  const suite = String(body.suite || "");
  const kind = String(body.kind || "");
  if (!key || !label) return NextResponse.json({ error: "Feature name and key are required." }, { status: 400 });
  if (!SUITES.includes(suite as (typeof SUITES)[number])) {
    return NextResponse.json({ error: "Choose a suite." }, { status: 400 });
  }
  if (!KINDS.includes(kind as (typeof KINDS)[number])) {
    return NextResponse.json({ error: "Choose how this feature is measured." }, { status: 400 });
  }

  const existing = await prisma.featureDefinition.findUnique({ where: { key } });
  if (existing) return NextResponse.json({ error: "That feature key already exists." }, { status: 409 });

  const last = await prisma.featureDefinition.findFirst({ orderBy: { sortOrder: "desc" } });
  const plans = await prisma.plan.findMany({ where: { scope: "ACCOUNT" }, select: { id: true } });
  const feature = await prisma.featureDefinition.create({
    data: {
      key,
      label,
      suite,
      kind: kind as (typeof KINDS)[number],
      shipped: false,
      early: false,
      sortOrder: (last?.sortOrder ?? 0) + 10,
      limits: {
        create: plans.map((plan) => ({
          plan: { connect: { id: plan.id } },
          enabled: false,
          quota: 0,
          allowlist: [] as Prisma.InputJsonValue,
        })),
      },
    },
  });
  return NextResponse.json({ feature });
}
