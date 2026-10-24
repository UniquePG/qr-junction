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

export function getAnonymousId(): string {
  const existing = readCookie(COOKIE_NAME);
  if (existing && /^[0-9a-f-]{36}$/i.test(existing)) return existing;

  const id = crypto.randomUUID();
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

  void fetch("/api/public/qr-events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {});
}
