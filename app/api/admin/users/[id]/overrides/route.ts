import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { forbidden, requireAdmin } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { configForFeature } from "@/lib/billing/config";
import { ensureAccountSubscription } from "@/lib/billing/seed";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin(request);
  if (!admin) return forbidden();
  const { id } = await params;
  const userId = Number(id);
  if (!userId) return NextResponse.json({ error: "User not found." }, { status: 404 });
  const body = await request.json().catch(() => ({}));
  const featureKey = String(body.featureKey || "");
  const definition = await prisma.featureDefinition.findUnique({ where: { key: featureKey } });
  if (!definition) {
    return NextResponse.json({ error: "Unknown feature." }, { status: 400 });
  }
  const subscription = await ensureAccountSubscription(userId);
  await prisma.entitlementOverride.deleteMany({
    where: { subscriptionId: subscription.id, featureKey },
  });
  const allowlist = Array.isArray(body.allowlist)
    ? body.allowlist.map((item: unknown) => String(item).trim()).filter(Boolean)
    : undefined;
  const config = "config" in body ? configForFeature(featureKey, body.config) : null;
  const override = await prisma.entitlementOverride.create({
    data: {
      subscriptionId: subscription.id,
      featureKey,
      enabled: typeof body.enabled === "boolean" ? body.enabled : null,
      quota: Number.isFinite(Number(body.quota)) ? Number(body.quota) : null,
      allowlist: allowlist as Prisma.InputJsonValue | undefined,
      config: config ?? Prisma.DbNull,
      endsAt: body.endsAt ? new Date(body.endsAt) : null,
      note: body.note ? String(body.note) : null,
      createdById: admin.id,
    },
  });
  await prisma.subscriptionEvent.create({
    data: {
      subscriptionId: subscription.id,
      type: "override_added",
      createdById: admin.id,
      payload: { featureKey, overrideId: override.id, endsAt: body.endsAt || null, note: body.note || null },
    },
  });
  return NextResponse.json({ override });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin(request);
  if (!admin) return forbidden();
  const { id } = await params;
  const userId = Number(id);
  const overrideId = new URL(request.url).searchParams.get("overrideId");
  if (!userId || !overrideId) return NextResponse.json({ error: "Missing override." }, { status: 400 });
  const override = await prisma.entitlementOverride.findFirst({
    where: { id: overrideId, subscription: { userId } },
  });
  if (!override) return NextResponse.json({ error: "Override not found." }, { status: 404 });
  await prisma.entitlementOverride.delete({ where: { id: override.id } });
  await prisma.subscriptionEvent.create({
    data: {
      subscriptionId: override.subscriptionId,
      type: "override_removed",
      createdById: admin.id,
      payload: { featureKey: override.featureKey, overrideId: override.id },
    },
  });
  return NextResponse.json({ success: true });
}
