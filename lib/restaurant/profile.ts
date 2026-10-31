export const WEEKDAYS = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
] as const;

export type WeekdayKey = (typeof WEEKDAYS)[number]["key"];

export type DayHours = {
  closed: boolean;
  open: string;
  close: string;
};

export type WeekHours = Record<WeekdayKey, DayHours>;

export const VENUE_TYPES = [
  "Restaurant",
  "Cafe",
  "Bakery",
  "Bar",
  "Cloud kitchen",
  "Sweet shop",
  "Quick service",
  "Fine dining",
] as const;

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "mr", label: "Marathi" },
  { code: "ta", label: "Tamil" },
  { code: "te", label: "Telugu" },
  { code: "kn", label: "Kannada" },
  { code: "ml", label: "Malayalam" },
  { code: "bn", label: "Bengali" },
  { code: "gu", label: "Gujarati" },
  { code: "pa", label: "Punjabi" },
  { code: "ar", label: "Arabic" },
] as const;

export const COUNTRIES = [
  "India",
  "United Arab Emirates",
  "United States",
  "United Kingdom",
  "Singapore",
  "Nepal",
  "Sri Lanka",
  "Canada",
  "Australia",
] as const;

export const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED"] as const;

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const GSTIN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function defaultWeek(): WeekHours {
  const day = (): DayHours => ({ closed: false, open: "11:00", close: "23:00" });
  return {
    mon: day(),
    tue: day(),
    wed: day(),
    thu: day(),
    fri: day(),
    sat: day(),
    sun: day(),
  };
}

export function readHours(value: unknown): WeekHours {
  const week = defaultWeek();
  if (!value || typeof value !== "object" || Array.isArray(value)) return week;
  const source = value as Record<string, unknown>;
  for (const day of WEEKDAYS) {
    const row = source[day.key];
    if (!row || typeof row !== "object" || Array.isArray(row)) continue;
    const record = row as Record<string, unknown>;
    const open = typeof record.open === "string" && TIME.test(record.open) ? record.open : week[day.key].open;
    const close = typeof record.close === "string" && TIME.test(record.close) ? record.close : week[day.key].close;
    week[day.key] = { closed: record.closed === true, open, close };
  }
  return week;
}

export type ProfilePatch = {
  name: string;
  description?: string | null;
  logoUrl?: string | null;
  coverImage?: string | null;
  currency?: string;
  taxRate?: number;
  taxName?: string;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  website?: string | null;
  instagram?: string | null;
  venueType?: string | null;
  cuisine?: string | null;
  language?: string;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  district?: string | null;
  state?: string | null;
  country?: string | null;
  pincode?: string | null;
  gstin?: string | null;
  fssai?: string | null;
  openingHours?: WeekHours;
  showOpeningHours?: boolean;
};

function has(raw: Record<string, unknown>, key: string) {
  return Object.prototype.hasOwnProperty.call(raw, key);
}

function text(value: unknown, max: number, keepLines = false): string | null {
  if (value == null) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  const normalized = keepLines
    ? raw.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n")
    : raw.replace(/\s+/g, " ");
  return normalized.slice(0, max);
}

function phoneText(value: unknown): string | null | false {
  const raw = text(value, 20);
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15) return false;
  return raw;
}

function mediaUrl(value: unknown): string | null | false {
  const url = text(value, 500);
  if (!url) return null;
  if (url.startsWith("/") || /^https?:\/\//i.test(url)) return url;
  return false;
}

export function parseProfileBody(body: unknown): { ok: true; patch: ProfilePatch } | { ok: false; error: string } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Invalid profile." };
  }
  const raw = body as Record<string, unknown>;
  const name = text(raw.name, 120);
  if (!name) return { ok: false, error: "Restaurant name is required." };

  const patch: ProfilePatch = { name };

  if (has(raw, "description")) patch.description = text(raw.description, 500, true);
  if (has(raw, "cuisine")) patch.cuisine = text(raw.cuisine, 120);
  if (has(raw, "addressLine1")) patch.addressLine1 = text(raw.addressLine1, 160);
  if (has(raw, "addressLine2")) patch.addressLine2 = text(raw.addressLine2, 160);
  if (has(raw, "city")) patch.city = text(raw.city, 80);
  if (has(raw, "district")) patch.district = text(raw.district, 80);
  if (has(raw, "state")) patch.state = text(raw.state, 80);

  if (has(raw, "logoUrl")) {
    const logoUrl = mediaUrl(raw.logoUrl);
    if (logoUrl === false) return { ok: false, error: "Logo address is not a valid image URL." };
    patch.logoUrl = logoUrl;
  }
  if (has(raw, "coverImage")) {
    const coverImage = mediaUrl(raw.coverImage);
    if (coverImage === false) return { ok: false, error: "Cover address is not a valid image URL." };
    patch.coverImage = coverImage;
  }

  if (has(raw, "currency")) {
    const currency = text(raw.currency, 8) || "INR";
    if (!(CURRENCIES as readonly string[]).includes(currency)) {
      return { ok: false, error: "Choose a supported currency." };
    }
    patch.currency = currency;
  }

  if (has(raw, "taxRate")) {
    const taxRate = raw.taxRate === "" || raw.taxRate == null ? 0 : Number(raw.taxRate);
    if (!Number.isFinite(taxRate) || taxRate < 0 || taxRate > 100) {
      return { ok: false, error: "Tax rate must be between 0 and 100." };
    }
    patch.taxRate = Math.round(taxRate * 100) / 100;
  }

  if (has(raw, "taxName")) patch.taxName = text(raw.taxName, 40) || "GST";

  if (has(raw, "phone")) {
    const phone = phoneText(raw.phone);
    if (phone === false) return { ok: false, error: "Enter a valid phone number." };
    patch.phone = phone;
  }
  if (has(raw, "whatsapp")) {
    const whatsapp = phoneText(raw.whatsapp);
    if (whatsapp === false) return { ok: false, error: "Enter a valid WhatsApp number." };
    patch.whatsapp = whatsapp;
  }
  if (has(raw, "email")) {
    const email = text(raw.email, 120)?.toLowerCase() ?? null;
    if (email && !EMAIL.test(email)) return { ok: false, error: "Enter a valid email address." };
    patch.email = email;
  }
  if (has(raw, "website")) {
    let website = text(raw.website, 200);
    if (website && !/^https?:\/\//i.test(website)) website = `https://${website}`;
    patch.website = website;
  }
  if (has(raw, "instagram")) {
    const instagram = text(raw.instagram, 80);
    patch.instagram = instagram
      ? instagram.replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/\/$/, "")
      : null;
  }
  if (has(raw, "venueType")) patch.venueType = text(raw.venueType, 40);
  if (has(raw, "language")) {
    const language = (text(raw.language, 8) || "en").toLowerCase();
    if (!/^[a-z]{2,8}$/.test(language)) return { ok: false, error: "Choose a language." };
    patch.language = language;
  }
  if (has(raw, "country")) {
    const country = text(raw.country, 80);
    if (!country) return { ok: false, error: "Choose a country." };
    patch.country = country;
  }
  if (has(raw, "pincode")) {
    const pincode = text(raw.pincode, 12)?.replace(/\s+/g, "") ?? null;
    const country = patch.country ?? text(raw.country, 80);
    if (country === "India" && pincode && !/^\d{6}$/.test(pincode)) {
      return { ok: false, error: "Indian PIN codes are 6 digits." };
    }
    patch.pincode = pincode;
  }
  if (has(raw, "gstin")) {
    const gstin = text(raw.gstin, 15)?.toUpperCase() ?? null;
    if (gstin && !GSTIN.test(gstin)) {
      return { ok: false, error: "GSTIN should be 15 characters, like 27AAAAA0000A1Z5." };
    }
    patch.gstin = gstin;
  }
  if (has(raw, "fssai")) {
    const fssai = text(raw.fssai, 14)?.replace(/\s+/g, "") ?? null;
    if (fssai && !/^\d{14}$/.test(fssai)) return { ok: false, error: "FSSAI licence numbers are 14 digits." };
    patch.fssai = fssai;
  }
  if (has(raw, "openingHours")) {
    if (!raw.openingHours || typeof raw.openingHours !== "object" || Array.isArray(raw.openingHours)) {
      return { ok: false, error: "Opening hours are incomplete." };
    }
    patch.openingHours = readHours(raw.openingHours);
  }
  if (has(raw, "showOpeningHours")) patch.showOpeningHours = raw.showOpeningHours === true;

  return { ok: true, patch };
}
