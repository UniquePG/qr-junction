export type TagTone = "amber" | "red" | "rose" | "emerald" | "sky" | "violet" | "slate" | "copper" | "navy";

export type TagPreset = {
  id: string;
  label: string;
  vibe: string;
  icon: "sparkles" | "flame" | "flameHot" | "chef" | "crown" | "candy" | "new" | "clock" | "star" | "pin" | "heart" | "scan";
  tone: TagTone;
};

export const MENU_TAG_PRESETS: TagPreset[] = [
  { id: "popular", label: "Popular", vibe: "Crowd favourite", icon: "sparkles", tone: "amber" },
  { id: "spicy", label: "Spicy", vibe: "Heat on the plate", icon: "flame", tone: "red" },
  { id: "extra_spicy", label: "Extra spicy", vibe: "For the brave", icon: "flameHot", tone: "rose" },
  { id: "chefs_special", label: "Chef's special", vibe: "Kitchen pride", icon: "chef", tone: "copper" },
  { id: "signature", label: "Signature dish", vibe: "House classic", icon: "crown", tone: "navy" },
  { id: "sweet", label: "Sweet", vibe: "Dessert energy", icon: "candy", tone: "violet" },
  { id: "new", label: "New", vibe: "Just landed", icon: "new", tone: "sky" },
  { id: "limited", label: "Limited time", vibe: "While it lasts", icon: "clock", tone: "rose" },
  { id: "must_try", label: "Must try", vibe: "Do not skip", icon: "star", tone: "amber" },
  { id: "junction_pick", label: "Junction pick", vibe: "QR Junction exclusive", icon: "pin", tone: "navy" },
  { id: "table_favourite", label: "Table favourite", vibe: "Tables ask for this", icon: "heart", tone: "emerald" },
  { id: "scan_star", label: "Scan star", vibe: "Most scanned dish", icon: "scan", tone: "sky" },
];

export const MAX_ITEM_TAGS = 8;
export const MAX_TAG_LENGTH = 24;
export const POPULAR_TAG_ID = "popular";

const PRESET_BY_ID = new Map(MENU_TAG_PRESETS.map((preset) => [preset.id, preset]));

export type ItemConfig = Record<string, unknown> & {
  tags?: string[];
};

function slugTag(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, MAX_TAG_LENGTH);
}

export function normalizeTag(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const raw = value.trim().replace(/\s+/g, " ");
  if (!raw) return null;
  const preset = PRESET_BY_ID.get(raw.toLowerCase()) || PRESET_BY_ID.get(slugTag(raw));
  if (preset) return preset.id;
  const custom = raw.slice(0, MAX_TAG_LENGTH);
  return custom || null;
}

export function normalizeTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const tags: string[] = [];
  const seen = new Set<string>();
  for (const entry of value) {
    const tag = normalizeTag(entry);
    if (!tag) continue;
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    tags.push(tag);
    if (tags.length >= MAX_ITEM_TAGS) break;
  }
  return tags;
}

export function parseItemConfig(value: unknown): ItemConfig | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const config = { ...(value as Record<string, unknown>) };
  if ("tags" in config) {
    const tags = normalizeTags(config.tags);
    if (tags.length) config.tags = tags;
    else delete config.tags;
  }
  return Object.keys(config).length ? (config as ItemConfig) : null;
}

export function tagsFromConfig(value: unknown): string[] {
  return parseItemConfig(value)?.tags ?? [];
}

export function withTags(existing: unknown, tags: string[]): ItemConfig | null {
  const base =
    existing && typeof existing === "object" && !Array.isArray(existing)
      ? { ...(existing as Record<string, unknown>) }
      : {};
  const next = normalizeTags(tags);
  if (next.length) base.tags = next;
  else delete base.tags;
  return Object.keys(base).length ? (base as ItemConfig) : null;
}

export function isPopularFromTags(tags: string[]) {
  return tags.some((tag) => tag.toLowerCase() === POPULAR_TAG_ID);
}

export function tagsForItem(item: { isPopular?: boolean; config?: unknown }): string[] {
  const tags = tagsFromConfig(item.config);
  if (item.isPopular && !tags.some((tag) => tag.toLowerCase() === POPULAR_TAG_ID)) {
    return [POPULAR_TAG_ID, ...tags].slice(0, MAX_ITEM_TAGS);
  }
  return tags;
}

export function presetForTag(tag: string): TagPreset | null {
  return PRESET_BY_ID.get(tag.toLowerCase()) || PRESET_BY_ID.get(slugTag(tag)) || null;
}

export function tagLabel(tag: string) {
  return presetForTag(tag)?.label || tag;
}

export function displayTags(item: { isPopular?: boolean; config?: unknown }, options?: { hidePopular?: boolean }) {
  const tags = tagsForItem(item);
  return options?.hidePopular ? tags.filter((tag) => tag.toLowerCase() !== POPULAR_TAG_ID) : tags;
}
