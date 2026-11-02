import { prisma } from "@/lib/prisma";
import { PlanLimitError } from "./errors";
import { periodStartFor } from "./period";
import { resolveOne } from "./resolve";
import { ensureAccountSubscription } from "./seed";

async function one(userId: number, key: string) {
  return resolveOne(userId, key);
}

function assertWritable(access: "full" | "read_only", key: string) {
  if (access === "read_only") {
    throw new PlanLimitError({
      feature: key,
      access: "read_only",
      message: "This plan is paused. Upgrade to make changes.",
    });
  }
}

export async function requireWritable(userId: number) {
  const feature = await one(userId, "platform.qr.dynamic");
  assertWritable(feature.access, "account");
}

export async function requireEnabled(userId: number, key: string) {
  const feature = await one(userId, key);
  if (!feature.shipped) return;
  assertWritable(feature.access, key);
  if (!feature.enabled) {
    throw new PlanLimitError({
      feature: key,
      message: `${feature.label} is not included on this plan.`,
    });
  }
}

export async function requireQuota(userId: number, key: string, used: number) {
  const feature = await one(userId, key);
  if (!feature.shipped) return;
  assertWritable(feature.access, key);
  if (feature.quota < 0) return;
  if (used >= feature.quota) {
    throw new PlanLimitError({
      feature: key,
      used,
      limit: feature.quota,
      message: `${feature.label} is at ${used} of ${feature.quota}.`,
    });
  }
}

export async function requireAllowed(userId: number, key: string, value: string) {
  const feature = await one(userId, key);
  if (!feature.shipped) return;
  assertWritable(feature.access, key);
  if (feature.quota < 0) return;
  if (feature.allowlist.includes(value)) return;
  throw new PlanLimitError({
    feature: key,
    message: `${feature.label} does not include ${value} on this plan.`,
  });
}

export async function allows(userId: number, key: string) {
  const feature = await one(userId, key);
  if (!feature.shipped) return false;
  return feature.enabled;
}

async function roomFor(userId: number, key: string, amount: number) {
  let feature = await one(userId, key);
  if (!feature.shipped) return feature;
  if (!feature.subscription) {
    await ensureAccountSubscription(userId);
    feature = await one(userId, key);
  }
  assertWritable(feature.access, key);
  if (feature.quota === 0) {
    throw new PlanLimitError({
      feature: key,
      used: feature.used,
      limit: 0,
      message: `${feature.label} is not included on this plan.`,
    });
  }
  if (feature.quota < 0) return feature;
  const used = feature.used ?? 0;
  if (used + amount > feature.quota) {
    throw new PlanLimitError({
      feature: key,
      used,
      limit: feature.quota,
      message: `${feature.label} is at ${used} of ${feature.quota}.`,
    });
  }
  return feature;
}

async function addUsage(userId: number, key: string, amount: number) {
  const feature = await roomFor(userId, key, amount);
  if (!feature.shipped || feature.quota < 0 || !feature.subscription) return;
  const periodStart = periodStartFor(feature.kind === "LIFETIME" ? "LIFETIME" : "MONTHLY", feature.subscription);
  await prisma.usageCounter.upsert({
    where: {
      subscriptionId_featureKey_periodStart: {
        subscriptionId: feature.subscription.id,
        featureKey: key,
        periodStart,
      },
    },
    create: {
      subscriptionId: feature.subscription.id,
      featureKey: key,
      periodStart,
      used: amount,
    },
    update: { used: { increment: amount } },
  });
}

async function aiImportKey(userId: number) {
  const monthly = await one(userId, "restaurant.ai_import.monthly");
  if (monthly.shipped && monthly.quota !== 0) return "restaurant.ai_import.monthly";
  return "restaurant.ai_import.lifetime";
}

export async function assertAiImportAvailable(userId: number) {
  await roomFor(userId, await aiImportKey(userId), 1);
}

export async function consumeAiImport(userId: number) {
  await addUsage(userId, await aiImportKey(userId), 1);
}

export async function reserveScan(userId: number, bucket: "platform" | "restaurant") {
  const key = bucket === "restaurant" ? "restaurant.scans.monthly" : "platform.scans.monthly";
  let feature = await one(userId, key);
  if (!feature.shipped || feature.quota < 0) return true;
  if (!feature.subscription) {
    await ensureAccountSubscription(userId);
    feature = await one(userId, key);
  }
  const used = feature.used ?? 0;
  if (used >= feature.quota) return false;
  if (!feature.subscription) return true;
  const periodStart = periodStartFor("MONTHLY", feature.subscription);
  await prisma.usageCounter.upsert({
    where: {
      subscriptionId_featureKey_periodStart: {
        subscriptionId: feature.subscription.id,
        featureKey: key,
        periodStart,
      },
    },
    create: {
      subscriptionId: feature.subscription.id,
      featureKey: key,
      periodStart,
      used: 1,
    },
    update: { used: { increment: 1 } },
  });
  return true;
}
