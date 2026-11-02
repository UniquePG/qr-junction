export type ConfigField = {
  key: string;
  label: string;
  min?: number;
  max?: number;
};

// Add a shape here when one feature needs settings beyond a count or a name list.
// Example: "restaurant.analytics.lookback": [{ key: "lookbackDays", label: "Lookback days", min: 1, max: 365 }]
export const FEATURE_CONFIGS: Record<string, ConfigField[]> = {};

export function asConfig(value: unknown): Record<string, number> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const config: Record<string, number> = {};
  for (const [key, raw] of Object.entries(value)) {
    const number = typeof raw === "number" ? raw : Number(raw);
    if (Number.isFinite(number)) config[key] = number;
  }
  return Object.keys(config).length ? config : null;
}

export function configForFeature(featureKey: string, value: unknown): Record<string, number> | null {
  const fields = FEATURE_CONFIGS[featureKey];
  if (!fields?.length) return null;
  const parsed = asConfig(value) ?? {};
  const config: Record<string, number> = {};
  for (const field of fields) {
    const number = parsed[field.key];
    if (number == null) continue;
    const min = field.min ?? Number.NEGATIVE_INFINITY;
    const max = field.max ?? Number.POSITIVE_INFINITY;
    config[field.key] = Math.min(max, Math.max(min, number));
  }
  return Object.keys(config).length ? config : null;
}

export function configNumber(feature: { config?: Record<string, number> | null }, key: string, fallback: number) {
  const number = feature.config?.[key];
  return typeof number === "number" && Number.isFinite(number) ? number : fallback;
}
