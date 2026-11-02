import { prisma } from "@/lib/prisma";
import { accessMode, graceDeadline } from "./access";
import { FEATURES, featureByKey, type FeatureKind, type FeatureSuite } from "./catalog";
import { asConfig } from "./config";
import type { AccessMode } from "./errors";
import { periodStartFor } from "./period";
import { ensureCatalog } from "./seed";

export type ResolvedFeature = {
  key: string;
  label: string;
  suite: FeatureSuite;
  kind: FeatureKind;
  shipped: boolean;
  early: boolean;
  enabled: boolean;
  quota: number;
  allowlist: string[];
  config: Record<string, number> | null;
  used: number | null;
  overridden: boolean;
};

export type ResolvedBilling = {
  plan: {
    code: string;
    name: string;
    monthlyPricePaise: number;
    yearlyPricePaise: number;
    lockedPricePaise: number | null;
  } | null;
  subscription: {
    id: string;
    status: string;
    source: string;
    access: AccessMode;
    interval: string | null;
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
    graceUntil: string | null;
    graceDays: number;
    graceEndsAt: string | null;
    cancelAtPeriodEnd: boolean;
  } | null;
  features: ResolvedFeature[];
};

type LimitShape = {
  enabled: boolean;
  quota: number;
  allowlist: string[];
  config: Record<string, number> | null;
};

function asAllowlist(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function freeLimit(key: string): LimitShape {
  const feature = FEATURES.find((item) => item.key === key);
  if (!feature) return { enabled: false, quota: 0, allowlist: [], config: null };
  return {
    enabled: feature.limits.free.enabled,
    quota: feature.limits.free.quota,
    allowlist: feature.limits.free.allowlist,
    config: asConfig(feature.limits.free.config),
  };
}

function mergeOverride(
  current: LimitShape,
  override: { enabled: boolean | null; quota: number | null; allowlist: unknown; config: unknown },
): LimitShape {
  return {
    enabled: override.enabled ?? current.enabled,
    quota: override.quota ?? current.quota,
    allowlist: override.allowlist == null ? current.allowlist : asAllowlist(override.allowlist),
    config: override.config == null ? current.config : asConfig(override.config),
  };
}

export async function resolveBilling(userId: number, now = new Date()): Promise<ResolvedBilling> {
  await ensureCatalog();
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    include: {
      plan: { include: { limits: true } },
      overrides: true,
    },
  });

  const access = accessMode(subscription, now);
  const definitions = await prisma.featureDefinition.findMany({ orderBy: { sortOrder: "asc" } });
  const limits = new Map<string, LimitShape>();
  for (const feature of definitions) limits.set(feature.key, freeLimit(feature.key));
  if (subscription) {
    for (const limit of subscription.plan.limits) {
      limits.set(limit.featureKey, {
        enabled: limit.enabled,
        quota: limit.quota,
        allowlist: asAllowlist(limit.allowlist),
        config: asConfig(limit.config),
      });
    }
  }

  const overridden = new Set<string>();
  if (subscription) {
    const activeOverrides = [...subscription.overrides]
      .filter((override) => override.startsAt <= now && (!override.endsAt || override.endsAt > now))
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    for (const override of activeOverrides) {
      const current = limits.get(override.featureKey) ?? freeLimit(override.featureKey);
      limits.set(override.featureKey, mergeOverride(current, override));
      overridden.add(override.featureKey);
    }
  }

  const features: ResolvedFeature[] = [];
  for (const feature of definitions) {
    const limit = limits.get(feature.key) ?? freeLimit(feature.key);
    let used: number | null = null;
    if (feature.shipped && (feature.kind === "MONTHLY" || feature.kind === "LIFETIME" || trackedQuota(feature.key))) {
      used = await usageFor(userId, subscription, feature.key, feature.kind, now);
    }
    features.push({
      key: feature.key,
      label: feature.label,
      suite: feature.suite as FeatureSuite,
      kind: feature.kind,
      shipped: feature.shipped,
      early: feature.early,
      enabled: limit.enabled,
      quota: limit.quota,
      allowlist: limit.allowlist,
      config: limit.config,
      used,
      overridden: overridden.has(feature.key),
    });
  }

  return {
    plan: subscription
      ? {
          code: subscription.plan.code,
          name: subscription.plan.name,
          monthlyPricePaise: subscription.plan.monthlyPricePaise,
          yearlyPricePaise: subscription.plan.yearlyPricePaise,
          lockedPricePaise: subscription.lockedPricePaise,
        }
      : { code: "free", name: "Free", monthlyPricePaise: 0, yearlyPricePaise: 0, lockedPricePaise: null },
    subscription: subscription
      ? {
          id: subscription.id,
          status: subscription.status,
          source: subscription.source,
          access,
          interval: subscription.interval,
          currentPeriodStart: subscription.currentPeriodStart?.toISOString() ?? null,
          currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
          graceUntil: subscription.graceUntil?.toISOString() ?? null,
          graceDays: subscription.graceDays,
          graceEndsAt: subscription.currentPeriodEnd ? graceDeadline(subscription)?.toISOString() ?? null : null,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        }
      : null,
    features,
  };
}

export function featureOf(billing: ResolvedBilling, key: string) {
  return billing.features.find((feature) => feature.key === key) ?? null;
}

async function usageFor(
  userId: number,
  subscription: { id: string; currentPeriodStart: Date | null } | null,
  key: string,
  kind: FeatureKind,
  now: Date,
) {
  if (kind === "QUOTA") return liveQuota(userId, key);
  if (!subscription) return 0;
  const periodStart = periodStartFor(kind === "LIFETIME" ? "LIFETIME" : "MONTHLY", subscription, now);
  const counter = await prisma.usageCounter.findUnique({
    where: {
      subscriptionId_featureKey_periodStart: {
        subscriptionId: subscription.id,
        featureKey: key,
        periodStart,
      },
    },
  });
  return counter?.used ?? 0;
}

function trackedQuota(key: string) {
  return key === "platform.qr.dynamic"
    || key === "platform.landing.count"
    || key === "platform.campaigns"
    || key === "reviews.qr.count"
    || key === "restaurant.menu.count"
    || key === "restaurant.tables";
}

async function liveQuota(userId: number, key: string) {
  if (key === "platform.qr.dynamic") {
    return prisma.qRCode.count({
      where: { userId, status: { not: "DELETED" }, type: { notIn: ["RESTAURANT_MENU", "REVIEW"] } },
    });
  }
  if (key === "platform.landing.count") {
    return prisma.landingPage.count({ where: { userId } });
  }
  if (key === "platform.campaigns") {
    return prisma.campaign.count({ where: { userId } });
  }
  if (key === "reviews.qr.count") {
    return prisma.qRCode.count({ where: { userId, status: { not: "DELETED" }, type: "REVIEW" } });
  }
  if (key === "restaurant.menu.count") {
    return prisma.menu.count({ where: { restaurant: { userId } } });
  }
  if (key === "restaurant.tables") {
    return prisma.restaurantTable.count({ where: { restaurant: { userId } } });
  }
  return 0;
}

export async function itemsOnMenu(menuId: number) {
  return prisma.menuItem.count({ where: { category: { menuId } } });
}

export async function resolveOne(userId: number, key: string, now = new Date()) {
  await ensureCatalog();
  const definition = featureByKey(key);
  const fallback = freeLimit(key);
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    include: { overrides: { where: { featureKey: key } } },
  });
  const access = accessMode(subscription, now);
  let limit = fallback;
  if (subscription) {
    const planLimit = await prisma.planLimit.findUnique({
      where: { planId_featureKey: { planId: subscription.planId, featureKey: key } },
    });
    if (planLimit) {
      limit = {
        enabled: planLimit.enabled,
        quota: planLimit.quota,
        allowlist: asAllowlist(planLimit.allowlist),
        config: asConfig(planLimit.config),
      };
    }
    const override = [...subscription.overrides]
      .filter((item) => item.startsAt <= now && (!item.endsAt || item.endsAt > now))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
    if (override) limit = mergeOverride(limit, override);
  }
  const kind = definition?.kind ?? "BOOLEAN";
  let used: number | null = null;
  if (definition?.shipped && (kind === "QUOTA" || kind === "MONTHLY" || kind === "LIFETIME")) {
    used = await usageFor(userId, subscription, key, kind, now);
  }
  return {
    access,
    subscription,
    shipped: definition?.shipped ?? false,
    label: definition?.label ?? key,
    kind,
    early: definition?.early ?? false,
    ...limit,
    used,
  };
}
