import { publicService } from "@/lib/api";

const COOKIE_NAME = "qj_anon_id";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export type GuestQrEventName = "GENERATED" | "DOWNLOADED";

const TAB_TO_QR_TYPE: Record<string, string> = {
  url: "URL",
  text: "TEXT",
  whatsapp: "WHATSAPP",
  email: "EMAIL",
  phone: "PHONE",
  wifi: "WIFI",
  snapchat: "SNAPCHAT",
  instagram: "INSTAGRAM",
  facebook: "FACEBOOK",
  linkedin: "LINKEDIN",
  telegram: "TELEGRAM",
  twitter: "TWITTER",
  contact: "CONTACT",
  sms: "SMS",
  app_download: "APP_DOWNLOAD",
  pdf: "PDF",
  landing_page: "LANDING_PAGE",
  review: "REVIEW",
};

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function createAnonymousId() {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    // insecure contexts (e.g. http://LAN-IP) may throw
  }
  // Fallback for non-secure contexts where randomUUID is unavailable.
  const bytes = new Uint8Array(16);
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function getAnonymousId(): string {
  const existing = readCookie(COOKIE_NAME);
  if (existing && /^[0-9a-f-]{36}$/i.test(existing)) return existing;

  const id = createAnonymousId();
  document.cookie = `${COOKIE_NAME}=${id}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  return id;
}

export function mapPublicQrType(tabOrType: string): string {
  const key = tabOrType.trim().toLowerCase();
  return TAB_TO_QR_TYPE[key] || tabOrType.toUpperCase();
}

export function inferGuestSource(pathname: string): string {
  if (pathname === "/") return "homepage";
  if (pathname === "/qr") return "designer";
  if (pathname.includes("-qr-code-generator")) return "landing";
  return "public";
}

export function trackGuestQrEvent(input: {
  event: GuestQrEventName;
  qrType: string;
  source?: string;
}): void {
  if (typeof window === "undefined") return;

  const payload = {
    sessionId: getAnonymousId(),
    event: input.event,
    qrType: mapPublicQrType(input.qrType),
    source: input.source || inferGuestSource(window.location.pathname),
    sourcePath: window.location.pathname,
  };

  void publicService.trackQrEvent(payload);
}
