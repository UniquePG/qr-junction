import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { FEATURES, PLAN_SEEDS, type PlanCode } from "./catalog";

let catalogReady: Promise<void> | null = null;

export function ensureCatalog() {
  if (!catalogReady) {
    catalogReady = writeCatalog().catch((error) => {
      catalogReady = null;
      throw error;
    });
  }
  return catalogReady;
}

async function writeCatalog() {
  for (const feature of FEATURES) {
    await prisma.featureDefinition.upsert({
      where: { key: feature.key },
      update: {
        suite: feature.suite,
        kind: feature.kind,
        label: feature.label,
        shipped: feature.shipped,
        early: feature.early,
        sortOrder: feature.sortOrder,
      },
      create: {
        key: feature.key,
        suite: feature.suite,
        kind: feature.kind,
        label: feature.label,
        shipped: feature.shipped,
        early: feature.early,
        sortOrder: feature.sortOrder,
      },
    });
  }

  for (const plan of PLAN_SEEDS) {
    const saved = await prisma.plan.upsert({
      where: { code: plan.code },
      update: {
        name: plan.name,
        sortOrder: plan.sortOrder,
      },
      create: {
        code: plan.code,
        scope: "ACCOUNT",
        name: plan.name,
        monthlyPricePaise: plan.monthlyPricePaise,
        yearlyPricePaise: plan.yearlyPricePaise,
        isPublic: plan.isPublic,
        active: true,
        sortOrder: plan.sortOrder,
      },
    });

    for (const feature of FEATURES) {
      const limit = feature.limits[plan.code as PlanCode];
      await prisma.planLimit.upsert({
        where: { planId_featureKey: { planId: saved.id, featureKey: feature.key } },
        update: {},
        create: {
          planId: saved.id,
          featureKey: feature.key,
          enabled: limit.enabled,
          quota: limit.quota,
          allowlist: limit.allowlist as Prisma.InputJsonValue,
          ...(limit.config ? { config: limit.config as Prisma.InputJsonValue } : {}),
        },
      });
    }
  }
}

export async function ensureAccountSubscription(userId: number) {
  await ensureCatalog();
  const existing = await prisma.subscription.findUnique({ where: { userId } });
  if (existing) return existing;
  const free = await prisma.plan.findUnique({ where: { code: "free" } });
  if (!free) throw new Error("Free plan is missing.");
  return prisma.subscription.create({
    data: {
      userId,
      planId: free.id,
      status: "ACTIVE",
      source: "SIGNUP",
      graceDays: free.graceDays,
    },
  });
}
