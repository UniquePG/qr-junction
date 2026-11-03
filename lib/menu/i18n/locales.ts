/** Product surface languages for v1 multilingual menus. */
export const MENU_I18N_CODES = ["en", "hi", "mr", "gu", "bn", "ta", "te"] as const;

export type MenuLocaleCode = (typeof MENU_I18N_CODES)[number];

export const MENU_I18N_LABELS: Record<MenuLocaleCode, string> = {
  en: "English",
  hi: "Hindi",
  mr: "Marathi",
  gu: "Gujarati",
  bn: "Bengali",
  ta: "Tamil",
  te: "Telugu",
};

/** Native / short labels for the guest switcher. */
export const MENU_I18N_NATIVE_LABELS: Record<MenuLocaleCode, string> = {
  en: "English",
  hi: "हिन्दी",
  mr: "मराठी",
  gu: "ગુજરાતી",
  bn: "বাংলা",
  ta: "தமிழ்",
  te: "తెలుగు",
};

export const DEFAULT_MENU_LOCALE: MenuLocaleCode = "en";

export type SarvamLangCode =
  | "en-IN"
  | "hi-IN"
  | "mr-IN"
  | "gu-IN"
  | "bn-IN"
  | "ta-IN"
  | "te-IN";

export const MENU_TO_SARVAM: Record<MenuLocaleCode, SarvamLangCode> = {
  en: "en-IN",
  hi: "hi-IN",
  mr: "mr-IN",
  gu: "gu-IN",
  bn: "bn-IN",
  ta: "ta-IN",
  te: "te-IN",
};

export type LocaleStatus = "ready" | "pending" | "failed";

export function isMenuLocaleCode(value: unknown): value is MenuLocaleCode {
  return typeof value === "string" && (MENU_I18N_CODES as readonly string[]).includes(value);
}

export function isTranslatableLocale(code: MenuLocaleCode): boolean {
  return code !== "en";
}
