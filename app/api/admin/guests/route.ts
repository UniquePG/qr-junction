import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { forbidden, requireAdmin } from "@/lib/adminAuth";
import { paginationMeta, parsePagination } from "@/lib/adminQuery";
import { prisma } from "@/lib/prisma";
import { ensureGuestQrEventsTable } from "@/lib/guestEventsDb";

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return forbidden();
  await ensureGuestQrEventsTable();

  const { searchParams } = new URL(request.url);
  const { page, pageSize, skip } = parsePagination(searchParams);
  const event = searchParams.get("event") || "";
  const type = searchParams.get("type") || "";
  const source = searchParams.get("source") || "";
  const search = (searchParams.get("search") || "").trim();

  const filters = Prisma.sql`
    ${event ? Prisma.sql`AND event = ${event}::"GuestQrEventType"` : Prisma.empty}
    ${type ? Prisma.sql`AND qr_type = ${type}::"QRType"` : Prisma.empty}
    ${source ? Prisma.sql`AND source = ${source}` : Prisma.empty}
    ${
      search
        ? Prisma.sql`AND (
            session_id ILIKE ${"%" + search + "%"}
            OR country ILIKE ${"%" + search + "%"}
            OR city ILIKE ${"%" + search + "%"}
            OR source_path ILIKE ${"%" + search + "%"}
          )`
        : Prisma.empty
    }
  `;

  const [countRows, events, totals] = await Promise.all([
    prisma.$queryRaw<{ total: number }[]>`
      SELECT COUNT(*)::int AS total
      FROM public.guest_qr_events
      WHERE 1=1 ${filters}
    `,
    prisma.$queryRaw<
      {
        id: number;
        session_id: string;
        event: string;
        qr_type: string;
        source: string;
        source_path: string;
        device_type: string;
        browser: string | null;
        os: string | null;
        country: string | null;
        city: string | null;
        created_at: Date;
      }[]
    >`
      SELECT
        id, session_id, event::text, qr_type::text, source, source_path,
        device_type::text, browser, os, country, city, created_at
      FROM public.guest_qr_events
      WHERE 1=1 ${filters}
      ORDER BY created_at DESC
      LIMIT ${pageSize} OFFSET ${skip}
    `,
    prisma.$queryRaw<{ generations: number; downloads: number; sessions: number }[]>`
      SELECT
        COUNT(*) FILTER (WHERE event = 'GENERATED')::int AS generations,
        COUNT(*) FILTER (WHERE event = 'DOWNLOADED')::int AS downloads,
        COUNT(DISTINCT session_id)::int AS sessions
      FROM public.guest_qr_events
    `,
  ]);

  const total = countRows[0]?.total || 0;

  return NextResponse.json({
    success: true,
    ...paginationMeta(total, page, pageSize),
    events: events.map((row) => ({
      id: row.id,
      sessionId: row.session_id,
      event: row.event,
      qrType: row.qr_type,
      source: row.source,
      sourcePath: row.source_path,
      deviceType: row.device_type,
      browser: row.browser,
      os: row.os,
      country: row.country,
      city: row.city,
      createdAt: row.created_at,
    })),
    totals: totals[0] || { generations: 0, downloads: 0, sessions: 0 },
  });
}
