export type FeatureKind = "BOOLEAN" | "QUOTA" | "MONTHLY" | "LIFETIME" | "ALLOWLIST";
export type FeatureSuite = "platform" | "restaurant" | "reviews";

export type LimitSeed = {
  enabled: boolean;
  quota: number;
  allowlist: string[];
  config?: Record<string, number>;
};

export type FeatureSeed = {
  key: string;
  suite: FeatureSuite;
  kind: FeatureKind;
  label: string;
  shipped: boolean;
  early: boolean;
  sortOrder: number;
  limits: Record<"free" | "starter" | "growth" | "legacy", LimitSeed>;
};

export const MENU_THEME_IDS = [
  "modern",
  "minimal",
  "premium",
  "cafe",
  "gourmet",
  "street",
  "editorial",
  "ticket",
  "neon",
  "thali",
  "garden",
  "stamp",
  "playbill",
  "board",
  "lantern",
  "polaroid",
  "bento",
] as const;

export const MENU_LANGUAGE_CODES = ["en", "hi", "mr", "ta", "te", "kn", "ml", "bn", "gu", "pa", "ar"] as const;

const on = (enabled: boolean): LimitSeed => ({ enabled, quota: 0, allowlist: [] });
const cap = (quota: number): LimitSeed => ({ enabled: quota !== 0, quota, allowlist: [] });
const list = (allowlist: string[]): LimitSeed => ({ enabled: true, quota: allowlist.length, allowlist });
const all = (): LimitSeed => ({ enabled: true, quota: -1, allowlist: [] });

type Row = Omit<FeatureSeed, "limits"> & {
  free: LimitSeed;
  starter: LimitSeed;
  growth: LimitSeed;
  legacy?: LimitSeed;
};

function feature(row: Row): FeatureSeed {
  const { free, starter, growth, legacy, ...rest } = row;
  return { ...rest, limits: { free, starter, growth, legacy: legacy ?? all() } };
}

export const FEATURES: FeatureSeed[] = [
  feature({ key: "platform.qr.dynamic", suite: "platform", kind: "QUOTA", label: "Dynamic QR codes", shipped: true, early: false, sortOrder: 10, free: cap(1), starter: cap(10), growth: cap(-1) }),
  feature({ key: "platform.scans.monthly", suite: "platform", kind: "MONTHLY", label: "Dynamic QR scans each month", shipped: true, early: false, sortOrder: 20, free: cap(200), starter: cap(-1), growth: cap(-1) }),
  feature({ key: "platform.analytics.advanced", suite: "platform", kind: "BOOLEAN", label: "Advanced scan analytics", shipped: true, early: false, sortOrder: 30, free: on(false), starter: on(true), growth: on(true) }),
  feature({ key: "platform.landing.count", suite: "platform", kind: "QUOTA", label: "Personal profile cards", shipped: true, early: false, sortOrder: 40, free: cap(1), starter: cap(5), growth: cap(-1) }),
  feature({ key: "platform.landing.analytics", suite: "platform", kind: "BOOLEAN", label: "Profile card analytics", shipped: true, early: false, sortOrder: 50, free: on(false), starter: on(false), growth: on(true) }),
  feature({ key: "platform.campaigns", suite: "platform", kind: "QUOTA", label: "Campaigns", shipped: true, early: false, sortOrder: 60, free: cap(1), starter: cap(5), growth: cap(-1) }),
  feature({ key: "platform.leads", suite: "platform", kind: "BOOLEAN", label: "Lead capture forms", shipped: true, early: false, sortOrder: 70, free: on(false), starter: on(true), growth: on(true) }),
  feature({ key: "platform.early_access", suite: "platform", kind: "BOOLEAN", label: "Early access to new features", shipped: true, early: false, sortOrder: 80, free: on(false), starter: on(false), growth: on(true) }),
  feature({ key: "restaurant.menu.count", suite: "restaurant", kind: "QUOTA", label: "Menus", shipped: true, early: false, sortOrder: 110, free: cap(1), starter: cap(5), growth: cap(-1) }),
  feature({ key: "restaurant.menu.items_per_menu", suite: "restaurant", kind: "QUOTA", label: "Items on each menu", shipped: true, early: false, sortOrder: 120, free: cap(20), starter: cap(100), growth: cap(-1) }),
  feature({ key: "restaurant.menu.edit", suite: "restaurant", kind: "BOOLEAN", label: "Menu updates", shipped: true, early: false, sortOrder: 130, free: on(false), starter: on(true), growth: on(true) }),
  feature({ key: "restaurant.menu.themes", suite: "restaurant", kind: "ALLOWLIST", label: "Menu layouts", shipped: true, early: false, sortOrder: 140, free: list(["modern", "minimal"]), starter: all(), growth: all() }),
  feature({ key: "restaurant.menu.themes.early", suite: "restaurant", kind: "BOOLEAN", label: "Early menu layouts", shipped: true, early: false, sortOrder: 150, free: on(false), starter: on(false), growth: on(true) }),
  feature({ key: "restaurant.tables", suite: "restaurant", kind: "QUOTA", label: "Tables", shipped: true, early: false, sortOrder: 160, free: cap(2), starter: cap(20), growth: cap(-1) }),
  feature({ key: "restaurant.scans.monthly", suite: "restaurant", kind: "MONTHLY", label: "Menu and table scans each month", shipped: true, early: false, sortOrder: 170, free: cap(50), starter: cap(500), growth: cap(-1) }),
  feature({ key: "restaurant.ai_import.lifetime", suite: "restaurant", kind: "LIFETIME", label: "AI menu scans, one-time", shipped: true, early: false, sortOrder: 180, free: cap(1), starter: cap(0), growth: cap(0) }),
  feature({ key: "restaurant.ai_import.monthly", suite: "restaurant", kind: "MONTHLY", label: "AI menu scans each month", shipped: true, early: false, sortOrder: 190, free: cap(0), starter: cap(5), growth: cap(-1) }),
  feature({ key: "restaurant.ordering", suite: "restaurant", kind: "BOOLEAN", label: "Live table orders", shipped: true, early: false, sortOrder: 200, free: on(false), starter: on(true), growth: on(true) }),
  feature({ key: "restaurant.menu.languages", suite: "restaurant", kind: "ALLOWLIST", label: "Menu languages", shipped: true, early: false, sortOrder: 210, free: list(["en"]), starter: list(["en", "hi", "mr"]), growth: list(["en", "hi", "mr", "gu", "bn", "ta", "te"]) }),
  feature({ key: "restaurant.offers", suite: "restaurant", kind: "BOOLEAN", label: "Offers and promotions", shipped: false, early: false, sortOrder: 220, free: on(false), starter: on(true), growth: on(true) }),
  feature({ key: "restaurant.offers.custom", suite: "restaurant", kind: "BOOLEAN", label: "Custom discounts", shipped: false, early: false, sortOrder: 230, free: on(false), starter: on(false), growth: on(true) }),
  feature({ key: "restaurant.orders.bill_attach", suite: "restaurant", kind: "BOOLEAN", label: "Attach a bill to an order", shipped: false, early: false, sortOrder: 240, free: on(false), starter: on(true), growth: on(true) }),
  feature({ key: "restaurant.orders.digital_bill", suite: "restaurant", kind: "BOOLEAN", label: "Digital bill sent to the customer", shipped: true, early: false, sortOrder: 250, free: on(false), starter: on(false), growth: on(true) }),
  feature({ key: "restaurant.orders.item_reviews", suite: "restaurant", kind: "BOOLEAN", label: "Reviews on dishes", shipped: false, early: false, sortOrder: 260, free: on(false), starter: on(false), growth: on(true) }),
  feature({ key: "restaurant.staff.seats", suite: "restaurant", kind: "QUOTA", label: "Staff logins", shipped: false, early: false, sortOrder: 270, free: cap(1), starter: cap(5), growth: cap(10) }),
  feature({ key: "reviews.qr.count", suite: "reviews", kind: "QUOTA", label: "Review QR codes", shipped: true, early: false, sortOrder: 310, free: cap(1), starter: cap(5), growth: cap(-1) }),
  feature({ key: "reviews.ai_suggestions", suite: "reviews", kind: "BOOLEAN", label: "AI review suggestions", shipped: true, early: false, sortOrder: 320, free: on(false), starter: on(true), growth: on(true) }),
  feature({ key: "reviews.smart_redirect", suite: "reviews", kind: "BOOLEAN", label: "Smart public review redirect", shipped: true, early: false, sortOrder: 330, free: on(false), starter: on(true), growth: on(true) }),
  feature({ key: "reviews.ai_analytics", suite: "reviews", kind: "BOOLEAN", label: "AI review analytics", shipped: true, early: false, sortOrder: 340, free: on(false), starter: on(false), growth: on(true) }),
];

export const PLAN_SEEDS = [
  { code: "free", name: "Free", monthlyPricePaise: 0, yearlyPricePaise: 0, isPublic: true, sortOrder: 0 },
  { code: "starter", name: "Starter", monthlyPricePaise: 29900, yearlyPricePaise: 299900, isPublic: true, sortOrder: 1 },
  { code: "growth", name: "Growth", monthlyPricePaise: 69900, yearlyPricePaise: 699900, isPublic: true, sortOrder: 2 },
  { code: "legacy", name: "Legacy", monthlyPricePaise: 0, yearlyPricePaise: 0, isPublic: false, sortOrder: 99 },
] as const;

export type PlanCode = (typeof PLAN_SEEDS)[number]["code"];

export function featureByKey(key: string) {
  return FEATURES.find((feature) => feature.key === key) ?? null;
}
