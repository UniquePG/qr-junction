import type {
  BogoRules,
  CollectionRules,
  ComboRules,
  ItemDiscountRules,
  MenuOfferType,
  OfferPresentation,
  OfferRules,
  OfferSchedule,
  OfferTargetInput,
  SpecialRules,
} from "./types";

export type RulesParseResult =
  | { ok: true; rules: OfferRules }
  | { ok: false; error: string };

function num(value: unknown, fallback?: number): number | null {
  if (value === undefined || value === null || value === "") {
    return fallback === undefined ? null : fallback;
  }
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return n;
}

function intIds(raw: unknown): number[] {
  if (!Array.isArray(raw)) return [];
  return [...new Set(raw.map((v) => Math.floor(Number(v))).filter((n) => Number.isFinite(n) && n > 0))];
}

export function parseSchedule(raw: unknown): OfferSchedule | null {
  if (raw == null) return null;
  if (typeof raw !== "object" || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;
  const schedule: OfferSchedule = {};
  if (Array.isArray(obj.daysOfWeek)) {
    schedule.daysOfWeek = obj.daysOfWeek
      .map((d) => Math.floor(Number(d)))
      .filter((d) => d >= 0 && d <= 6);
  }
  if (Array.isArray(obj.windows)) {
    schedule.windows = obj.windows
      .map((w) => {
        if (!w || typeof w !== "object") return null;
        const start = String((w as { start?: unknown }).start || "").trim();
        const end = String((w as { end?: unknown }).end || "").trim();
        if (!/^\d{2}:\d{2}$/.test(start) || !/^\d{2}:\d{2}$/.test(end)) return null;
        return { start, end };
      })
      .filter(Boolean) as OfferSchedule["windows"];
  }
  if (typeof obj.timezone === "string" && obj.timezone.trim()) {
    schedule.timezone = obj.timezone.trim();
  }
  return schedule;
}

export function parsePresentation(raw: unknown): OfferPresentation | null {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;
  const emphasis = obj.emphasis;
  const out: OfferPresentation = {};
  if (emphasis === "rail" || emphasis === "hero" || emphasis === "badge") out.emphasis = emphasis;
  if (typeof obj.accent === "string" && obj.accent.trim()) out.accent = obj.accent.trim().slice(0, 32);
  return out;
}

export function parseTargets(raw: unknown): OfferTargetInput[] {
  if (!Array.isArray(raw)) return [];
  const out: OfferTargetInput[] = [];
  const seen = new Set<string>();
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const kind = (row as { kind?: unknown }).kind;
    const refId = Math.floor(Number((row as { refId?: unknown }).refId));
    if ((kind !== "ITEM" && kind !== "CATEGORY") || !Number.isFinite(refId) || refId < 1) continue;
    const key = `${kind}:${refId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ kind, refId });
  }
  return out;
}

function parseItemDiscount(raw: Record<string, unknown>): RulesParseResult {
  const mode = raw.mode;
  const value = num(raw.value);
  if (mode !== "percent" && mode !== "amount") {
    return { ok: false, error: "Discount mode must be percent or amount." };
  }
  if (value == null || value <= 0) return { ok: false, error: "Enter a discount value greater than 0." };
  if (mode === "percent" && value > 100) return { ok: false, error: "Percent discount cannot exceed 100." };
  const rules: ItemDiscountRules = { mode, value };
  const max = num(raw.maxDiscountPerItem);
  if (max != null && max > 0) rules.maxDiscountPerItem = max;
  return { ok: true, rules };
}

function parseBogo(raw: Record<string, unknown>): RulesParseResult {
  const buyQty = Math.floor(num(raw.buyQty, 1) ?? 1);
  const getQty = Math.floor(num(raw.getQty, 1) ?? 1);
  const getMode = raw.getMode;
  if (buyQty < 1 || buyQty > 20) return { ok: false, error: "Buy quantity must be 1–20." };
  if (getQty < 1 || getQty > 20) return { ok: false, error: "Get quantity must be 1–20." };
  if (getMode !== "free" && getMode !== "percent" && getMode !== "amount") {
    return { ok: false, error: "BOGO reward must be free, percent, or amount." };
  }
  const rules: BogoRules = {
    buyQty,
    getQty,
    getMode,
    // Explicit true = same dish only; otherwise treat as a pool (industry default).
    sameItem: raw.sameItem === true,
  };
  if (getMode !== "free") {
    const getValue = num(raw.getValue);
    if (getValue == null || getValue <= 0) return { ok: false, error: "Enter the get discount value." };
    if (getMode === "percent" && getValue > 100) return { ok: false, error: "Percent cannot exceed 100." };
    rules.getValue = getValue;
  }
  return { ok: true, rules };
}

function parseCombo(raw: Record<string, unknown>): RulesParseResult {
  const packagePrice = num(raw.packagePrice);
  if (packagePrice == null || packagePrice < 0) return { ok: false, error: "Enter a combo package price." };
  if (!Array.isArray(raw.slots) || raw.slots.length < 2) {
    return { ok: false, error: "A combo needs at least two slots." };
  }
  const slots: ComboRules["slots"] = [];
  for (const slot of raw.slots) {
    if (!slot || typeof slot !== "object") continue;
    const s = slot as Record<string, unknown>;
    const label = String(s.label || "").trim().slice(0, 40) || "Item";
    const minQty = Math.max(1, Math.floor(num(s.minQty, 1) ?? 1));
    const itemIds = intIds(s.itemIds);
    if (!itemIds.length) return { ok: false, error: `Pick items for combo slot “${label}”.` };
    slots.push({ label, minQty, itemIds });
  }
  if (slots.length < 2) return { ok: false, error: "A combo needs at least two slots." };
  const rules: ComboRules = { slots, packagePrice };
  const compareAt = num(raw.compareAtPrice);
  if (compareAt != null && compareAt > packagePrice) rules.compareAtPrice = compareAt;
  return { ok: true, rules };
}

function parseCollection(raw: Record<string, unknown>): RulesParseResult {
  const mode = raw.mode;
  if (mode !== "under_price" && mode !== "manual") {
    return { ok: false, error: "Collection mode must be under_price or manual." };
  }
  const rules: CollectionRules = { mode };
  if (mode === "under_price") {
    const maxPrice = num(raw.maxPrice);
    if (maxPrice == null || maxPrice <= 0) return { ok: false, error: "Enter the Under price amount." };
    rules.maxPrice = maxPrice;
  }
  if (typeof raw.currencyHint === "string" && raw.currencyHint.trim()) {
    rules.currencyHint = raw.currencyHint.trim().slice(0, 8);
  }
  return { ok: true, rules };
}

function parseSpecial(raw: Record<string, unknown>): RulesParseResult {
  const rules: SpecialRules = {};
  const ids = intIds(raw.highlightItemIds);
  if (ids.length) rules.highlightItemIds = ids;
  return { ok: true, rules };
}

export function parseRules(type: MenuOfferType, raw: unknown): RulesParseResult {
  const obj = raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  switch (type) {
    case "ITEM_DISCOUNT":
      return parseItemDiscount(obj);
    case "BOGO":
      return parseBogo(obj);
    case "COMBO":
      return parseCombo(obj);
    case "COLLECTION":
      return parseCollection(obj);
    case "SPECIAL":
      return parseSpecial(obj);
    default:
      return { ok: false, error: "Unknown offer type." };
  }
}

export function isMenuOfferType(value: unknown): value is MenuOfferType {
  return (
    value === "ITEM_DISCOUNT" ||
    value === "BOGO" ||
    value === "COMBO" ||
    value === "COLLECTION" ||
    value === "SPECIAL"
  );
}

export function defaultRulesFor(type: MenuOfferType): OfferRules {
  switch (type) {
    case "ITEM_DISCOUNT":
      return { mode: "percent", value: 10 };
    case "BOGO":
      // Pool of eligible dishes by default (Buy any coffee, get any coffee free).
      return { buyQty: 1, getQty: 1, getMode: "free", sameItem: false };
    case "COMBO":
      return { slots: [], packagePrice: 0 };
    case "COLLECTION":
      return { mode: "under_price", maxPrice: 199 };
    case "SPECIAL":
      return { highlightItemIds: [] };
  }
}
