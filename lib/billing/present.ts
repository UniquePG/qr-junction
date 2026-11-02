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

export function asHighlights(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean);
}

export const SUITE_LABELS: Record<string, string> = {
  platform: "QR codes and profiles",
  restaurant: "Restaurant",
  reviews: "Reviews",
};
