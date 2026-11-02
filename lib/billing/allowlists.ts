import { MENU_LANGUAGE_CODES, MENU_THEME_IDS } from "./catalog";

export type AllowOption = { value: string; label: string };

const THEME_LABELS: Record<string, string> = {
  modern: "Modern Card",
  minimal: "Minimal List",
  premium: "Premium Restaurant",
  cafe: "Cafe Board",
  gourmet: "Gourmet Night",
  street: "Street Stall",
  editorial: "Magazine Cover",
  ticket: "Kitchen Ticket",
  neon: "Night Market",
  thali: "Thali Circle",
  garden: "Garden Board",
  stamp: "Postage Stamp",
  playbill: "Playbill",
  board: "Departure Board",
  lantern: "Lantern Fest",
  polaroid: "Polaroid Wall",
  bento: "Bento Box",
};

const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  mr: "Marathi",
  ta: "Tamil",
  te: "Telugu",
  kn: "Kannada",
  ml: "Malayalam",
  bn: "Bengali",
  gu: "Gujarati",
  pa: "Punjabi",
  ar: "Arabic",
};

export const FEATURE_ALLOWLISTS: Record<string, AllowOption[]> = {
  "restaurant.menu.themes": MENU_THEME_IDS.map((id) => ({ value: id, label: THEME_LABELS[id] || id })),
  "restaurant.menu.languages": MENU_LANGUAGE_CODES.map((code) => ({ value: code, label: LANGUAGE_LABELS[code] || code })),
};

export function allowlistLabel(featureKey: string, value: string) {
  return FEATURE_ALLOWLISTS[featureKey]?.find((option) => option.value === value)?.label || value;
}
