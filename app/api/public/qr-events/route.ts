import { NextRequest, NextResponse, userAgent } from "next/server";
import { resolveGeoLocation } from "@/lib/geo";
import { prisma } from "@/lib/prisma";
import { ensureGuestQrEventsTable } from "@/lib/guestEventsDb";

const SESSION_RE = /^[0-9a-f-]{36}$/i;
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 40;
const DEDUPE_MS = 3_000;
const ALLOWED_SOURCES = new Set(["homepage", "designer", "landing", "public"]);
const ALLOWED_TYPES = new Set([
  "URL","TEXT","WHATSAPP","EMAIL","PHONE","WIFI","SNAPCHAT","INSTAGRAM","FACEBOOK",
  "LINKEDIN","TELEGRAM","TWITTER","CONTACT","SMS","APP_DOWNLOAD","PDF","LANDING_PAGE",
  "REVIEW","RESTAURANT_MENU",
]);
const ALLOWED_EVENTS = new Set(["GENERATED", "DOWNLOADED"]);

function clientIp(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}

export async function POST(request: NextRequest) {
  let body: {
    sessionId?: string;
    event?: string;
    qrType?: string;
    source?: string;
    sourcePath?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const cookieSession = request.cookies.get("qj_anon_id")?.value;
  const sessionId = (body.sessionId || cookieSession || "").trim();
  if (!SESSION_RE.test(sessionId)) {
    return NextResponse.json({ error: "Invalid session." }, { status: 400 });
  }

  const event = ALLOWED_EVENTS.has(body.event || "") ? body.event! : "GENERATED";
  const qrType = (body.qrType || "").toUpperCase();
  if (!ALLOWED_TYPES.has(qrType)) {
    return NextResponse.json({ error: "Invalid QR type." }, { status: 400 });
  }

  const source = ALLOWED_SOURCES.has(body.source || "") ? body.source! : "public";
  const sourcePath = (body.sourcePath || "/").slice(0, 180);

  await ensureGuestQrEventsTable();

  const recent = await prisma.$queryRaw<
    { event: string; qr_type: string; source_path: string; created_at: Date }[]
  >`
    SELECT event::text, qr_type::text, source_path, created_at
    FROM public.guest_qr_events
    WHERE session_id = ${sessionId}
      AND created_at >= ${new Date(Date.now() - RATE_WINDOW_MS)}
    ORDER BY created_at DESC
    LIMIT ${RATE_LIMIT + 1}
  `;

  if (recent.length >= RATE_LIMIT) {
    return NextResponse.json({ ok: true, limited: true });
  }

  const last = recent[0];
  if (
    last &&
    last.event === event &&
    last.qr_type === qrType &&
    last.source_path === sourcePath &&
    Date.now() - new Date(last.created_at).getTime() < DEDUPE_MS
  ) {
    return NextResponse.json({ ok: true, deduped: true });
  }

  const ua = userAgent(request);
  let deviceType = "DESKTOP";
  if (ua.device.type === "mobile") deviceType = "MOBILE";
  else if (ua.device.type === "tablet") deviceType = "TABLET";
  else if (ua.device.type) deviceType = "UNKNOWN";

  const geo = await resolveGeoLocation(clientIp(request), request.headers);

  await prisma.$executeRaw`
    INSERT INTO public.guest_qr_events
      (session_id, event, qr_type, source, source_path, device_type, browser, os, country, city)
    VALUES
      (
        ${sessionId},
        ${event}::"GuestQrEventType",
        ${qrType}::"QRType",
        ${source},
        ${sourcePath},
        ${deviceType}::"DeviceType",
        ${ua.browser.name || null},
        ${ua.os.name || null},
        ${geo.country},
        ${geo.city}
      )
  `;

  const response = NextResponse.json({ ok: true });
  response.cookies.set("qj_anon_id", sessionId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}
