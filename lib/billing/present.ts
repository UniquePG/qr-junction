import { allowlistLabel } from "./allowlists";

export type FeatureView = {
  key: string;
  label: string;
  suite: string;
  kind: string;
  shipped: boolean;
  enabled: boolean;
  quota: number;
  allowlist: string[];
  used: number | null;
  overridden?: boolean;
  included: boolean;
  text: string;
};

export function presentFeature(feature: {
  key: string;
  label: string;
  suite: string;
  kind: string;
  shipped: boolean;
  enabled: boolean;
  quota: number;
  allowlist: string[];
  used?: number | null;
  overridden?: boolean;
}): FeatureView {
  const used = feature.used ?? null;
  let included = false;
  let text = feature.label;

  if (feature.kind === "BOOLEAN") {
    included = feature.enabled;
    text = feature.label;
  } else if (feature.kind === "ALLOWLIST") {
    included = feature.quota < 0 || feature.allowlist.length > 0;
    text = feature.quota < 0
      ? `${feature.label} · All`
      : feature.allowlist.length
        ? `${feature.label} · ${feature.allowlist.map((value) => allowlistLabel(feature.key, value)).join(", ")}`
        : feature.label;
  } else if (feature.quota < 0) {
    included = true;
    text = `${feature.label} · Unlimited`;
  } else if (feature.quota > 0) {
    included = true;
    const period = feature.kind === "MONTHLY" ? " / month" : feature.kind === "LIFETIME" ? " total" : "";
    text = `${feature.label} · ${feature.quota}${period}`;
  }

  return { ...feature, used, included, text };
}

export function usageLabel(feature: FeatureView) {
  if (!feature.shipped) return feature.included ? "On the plan, not live yet" : "Not included";
  if (feature.kind === "BOOLEAN") return feature.enabled ? "Included" : "Not included";
  if (feature.kind === "ALLOWLIST") {
    if (feature.quota < 0) return "All values";
    if (!feature.allowlist.length) return "None";
    return feature.allowlist.map((value) => allowlistLabel(feature.key, value)).join(", ");
  }
  if (feature.quota === 0) return "Not included";
  if (feature.quota < 0) {
    return feature.used == null ? "Unlimited" : `${feature.used.toLocaleString("en-IN")} used · Unlimited`;
  }
  if (feature.used == null) return `Up to ${feature.quota.toLocaleString("en-IN")}`;
  return `${feature.used.toLocaleString("en-IN")} of ${feature.quota.toLocaleString("en-IN")}`;
}

/** Structured marketing copy for a plan card. All fields optional — omit empty ones in UI. */
export type PlanHighlights = {
  section: string;
  subtitle: string;
  description: string;
  features: string[];
  bestFor: string;
};

export function emptyPlanHighlights(): PlanHighlights {
  return { section: "", subtitle: "", description: "", features: [], bestFor: "" };
}

function trimText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asFeatureLines(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean);
}

/**
 * Accepts legacy `string[]` and the structured object shape.
 * Alternate keys (sub_title, best_for, etc.) are normalized on read.
 */
export function parsePlanHighlights(value: unknown): PlanHighlights {
  if (Array.isArray(value)) {
    return { ...emptyPlanHighlights(), features: asFeatureLines(value) };
  }
  if (!value || typeof value !== "object") return emptyPlanHighlights();
  const row = value as Record<string, unknown>;
  return {
    section: trimText(row.section),
    subtitle: trimText(row.subtitle ?? row.sub_title ?? row.catchyLine ?? row.catchy_line),
    description: trimText(row.description ?? row.planDescription ?? row.plan_description),
    features: asFeatureLines(row.features ?? row.featuresToDisplay ?? row.lines ?? row.highlights),
    bestFor: trimText(row.bestFor ?? row.best_for ?? row.bestForLine),
  };
}

/** Persist a clean object (still valid Json for the plans.highlights column). */
export function serializePlanHighlights(value: unknown): PlanHighlights {
  const parsed = parsePlanHighlights(value);
  return {
    section: parsed.section,
    subtitle: parsed.subtitle,
    description: parsed.description,
    features: parsed.features,
    bestFor: parsed.bestFor,
  };
}

export function planHighlightsHasContent(value: PlanHighlights | unknown) {
  const h = parsePlanHighlights(value);
  return Boolean(h.section || h.subtitle || h.description || h.features.length || h.bestFor);
}

/** @deprecated Prefer parsePlanHighlights — returns feature bullets only for older callers. */
export function asHighlights(value: unknown) {
  return parsePlanHighlights(value).features;
}

export const SUITE_LABELS: Record<string, string> = {
  platform: "QR codes and profiles",
  restaurant: "Restaurant",
  reviews: "Reviews",
};
