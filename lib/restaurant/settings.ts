export type RestaurantSettings = {
  digitalBill?: boolean;
  orderSound?: boolean;
};

const KNOWN_KEYS = new Set(["digitalBill", "orderSound"]);

export function getRestaurantSettings(raw: unknown): Required<RestaurantSettings> {
  const source =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {};
  return {
    digitalBill: source.digitalBill === true,
    orderSound: source.orderSound === true,
  };
}

export function mergeRestaurantSettings(
  raw: unknown,
  patch: Partial<RestaurantSettings>,
): RestaurantSettings {
  const current = getRestaurantSettings(raw);
  const next: RestaurantSettings = { ...current };

  for (const [key, value] of Object.entries(patch)) {
    if (!KNOWN_KEYS.has(key)) continue;
    if (typeof value !== "boolean") continue;
    (next as Record<string, boolean>)[key] = value;
  }

  return next;
}

export function isKnownSettingsKey(key: string): key is keyof RestaurantSettings {
  return KNOWN_KEYS.has(key);
}
