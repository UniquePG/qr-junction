import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { forbidden, requireAdmin } from "@/lib/adminAuth";
import { dateFilter, parseAdminRange } from "@/lib/adminQuery";
import { prisma } from "@/lib/prisma";
import { ensureGuestQrEventsTable } from "@/lib/guestEventsDb";

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return forbidden();
  await ensureGuestQrEventsTable();

  const { searchParams } = new URL(request.url);
  const { startDate, endDate } = parseAdminRange(searchParams);

  const userRange = dateFilter(Prisma.raw(`"created_at"`), startDate, endDate);
  const qrRange = dateFilter(Prisma.raw(`"created_at"`), startDate, endDate);
  const scanRange = dateFilter(Prisma.raw(`"scanned_at"`), startDate, endDate);
  const reviewRange = dateFilter(Prisma.raw(`"created_at"`), startDate, endDate);
  const restaurantRange = dateFilter(Prisma.raw(`"created_at"`), startDate, endDate);
  const leadRange = dateFilter(Prisma.raw(`"created_at"`), startDate, endDate);
  const conversionRange = dateFilter(Prisma.raw(`"occurred_at"`), startDate, endDate);
  const guestRange = dateFilter(Prisma.raw(`"created_at"`), startDate, endDate);

  const [
    totals,
    usersByDay,
    qrsByDay,
    scansByDay,
    qrTypeMix,
    deviceMix,
    countries,
    cities,
    scanPoints,
  ] = await Promise.all([
    prisma.$queryRaw<
      {
        total_users: number;
        new_users: number;
        total_qrs: number;
        new_qrs: number;
        total_scans: number;
        unique_visitors: number;
        review_qrs: number;
        review_responses: number;
        avg_rating: number | null;
        restaurants: number;
        menus: number;
        tables: number;
        leads: number;
        conversions: number;
      }[]
    >`
      SELECT
        (SELECT COUNT(*)::int FROM users) AS total_users,
        (SELECT COUNT(*)::int FROM users WHERE 1=1 ${userRange}) AS new_users,
        (SELECT COUNT(*)::int FROM qr_codes WHERE status <> 'DELETED') AS total_qrs,
        (SELECT COUNT(*)::int FROM qr_codes WHERE status <> 'DELETED' ${qrRange}) AS new_qrs,
        (SELECT COUNT(*)::int FROM scans WHERE 1=1 ${scanRange}) AS total_scans,
        (SELECT COUNT(DISTINCT visitor_id)::int FROM scans WHERE 1=1 ${scanRange}) AS unique_visitors,
        (SELECT COUNT(*)::int FROM qr_codes WHERE type = 'REVIEW' AND status <> 'DELETED') AS review_qrs,
        (SELECT COUNT(*)::int FROM review_responses WHERE 1=1 ${reviewRange}) AS review_responses,
        (SELECT AVG(rating)::float FROM review_responses WHERE 1=1 ${reviewRange}) AS avg_rating,
        (SELECT COUNT(*)::int FROM restaurants WHERE 1=1 ${restaurantRange}) AS restaurants,
        (SELECT COUNT(*)::int FROM menus) AS menus,
        (SELECT COUNT(*)::int FROM restaurant_tables) AS tables,
        (SELECT COUNT(*)::int FROM leads WHERE 1=1 ${leadRange}) AS leads,
        (SELECT COUNT(*)::int FROM conversions WHERE 1=1 ${conversionRange}) AS conversions
    `,
    prisma.$queryRaw<{ day: Date; count: number }[]>`
      SELECT DATE_TRUNC('day', created_at)::date AS day, COUNT(*)::int AS count
      FROM users
      WHERE 1=1 ${userRange}
      GROUP BY 1
      ORDER BY 1
    `,
    prisma.$queryRaw<{ day: Date; type: string; count: number }[]>`
      SELECT DATE_TRUNC('day', created_at)::date AS day, type::text AS type, COUNT(*)::int AS count
      FROM qr_codes
      WHERE status <> 'DELETED' ${qrRange}
      GROUP BY 1, 2
      ORDER BY 1
    `,
    prisma.$queryRaw<{ day: Date; count: number }[]>`
      SELECT DATE_TRUNC('day', scanned_at)::date AS day, COUNT(*)::int AS count
      FROM scans
      WHERE 1=1 ${scanRange}
      GROUP BY 1
      ORDER BY 1
    `,
    prisma.$queryRaw<{ type: string; count: number }[]>`
      SELECT type::text AS type, COUNT(*)::int AS count
      FROM qr_codes
      WHERE status <> 'DELETED'
      GROUP BY 1
      ORDER BY count DESC
    `,
    prisma.$queryRaw<{ device: string; count: number }[]>`
      SELECT device_type::text AS device, COUNT(*)::int AS count
      FROM scans
      WHERE 1=1 ${scanRange}
      GROUP BY 1
      ORDER BY count DESC
    `,
    prisma.$queryRaw<{ country: string; count: number }[]>`
      SELECT COALESCE(NULLIF(country, ''), 'Unknown') AS country, COUNT(*)::int AS count
      FROM scans
      WHERE 1=1 ${scanRange}
      GROUP BY 1
      ORDER BY count DESC
      LIMIT 10
    `,
    prisma.$queryRaw<{ city: string; country: string; count: number }[]>`
      SELECT
        COALESCE(NULLIF(city, ''), 'Unknown') AS city,
        COALESCE(NULLIF(country, ''), 'Unknown') AS country,
        COUNT(*)::int AS count
      FROM scans
      WHERE 1=1 ${scanRange}
      GROUP BY 1, 2
      ORDER BY count DESC
      LIMIT 10
    `,
    prisma.$queryRaw<
      { lat: number; lng: number; city: string; country: string; count: number }[]
    >`
      SELECT
        AVG(latitude)::float AS lat,
        AVG(longitude)::float AS lng,
        COALESCE(NULLIF(city, ''), 'Unknown') AS city,
        COALESCE(NULLIF(country, ''), 'Unknown') AS country,
        COUNT(*)::int AS count
      FROM scans
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL ${scanRange}
      GROUP BY city, country
      ORDER BY count DESC
      LIMIT 250
    `,
  ]);

  const [guestTotals, guestByDay, guestTypes, guestSources] = await Promise.all([
    prisma.$queryRaw<
      { guest_generations: number; guest_downloads: number; guest_sessions: number }[]
    >`
      SELECT
        COUNT(*) FILTER (WHERE event = 'GENERATED')::int AS guest_generations,
        COUNT(*) FILTER (WHERE event = 'DOWNLOADED')::int AS guest_downloads,
        COUNT(DISTINCT session_id)::int AS guest_sessions
      FROM public.guest_qr_events
      WHERE 1=1 ${guestRange}
    `,
    prisma.$queryRaw<{ day: Date; count: number }[]>`
      SELECT DATE_TRUNC('day', created_at)::date AS day, COUNT(*)::int AS count
      FROM public.guest_qr_events
      WHERE event = 'GENERATED' ${guestRange}
      GROUP BY 1
      ORDER BY 1
    `,
    prisma.$queryRaw<{ type: string; count: number }[]>`
      SELECT qr_type::text AS type, COUNT(*)::int AS count
      FROM public.guest_qr_events
      WHERE event = 'GENERATED' ${guestRange}
      GROUP BY 1
      ORDER BY count DESC
    `,
    prisma.$queryRaw<{ source: string; count: number }[]>`
      SELECT source, COUNT(*)::int AS count
      FROM public.guest_qr_events
      WHERE event = 'GENERATED' ${guestRange}
      GROUP BY 1
      ORDER BY count DESC
    `,
  ]);

  const kpi = totals[0] || {
    total_users: 0,
    new_users: 0,
    total_qrs: 0,
    new_qrs: 0,
    total_scans: 0,
    unique_visitors: 0,
    review_qrs: 0,
    review_responses: 0,
    avg_rating: 0,
    restaurants: 0,
    menus: 0,
    tables: 0,
    leads: 0,
    conversions: 0,
  };

  const dayKey = (value: Date) =>
    new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return NextResponse.json({
    success: true,
    stats: {
      totalUsers: kpi.total_users,
      newUsers: kpi.new_users,
      totalQrs: kpi.total_qrs,
      newQrs: kpi.new_qrs,
      totalScans: kpi.total_scans,
      uniqueVisitors: kpi.unique_visitors,
      reviewQrs: kpi.review_qrs,
      reviewResponses: kpi.review_responses,
      avgRating: Number(kpi.avg_rating || 0),
      restaurants: kpi.restaurants,
      menus: kpi.menus,
      tables: kpi.tables,
      leads: kpi.leads,
      conversions: kpi.conversions,
      guestGenerations: guestTotals[0]?.guest_generations || 0,
      guestDownloads: guestTotals[0]?.guest_downloads || 0,
      guestSessions: guestTotals[0]?.guest_sessions || 0,
    },
    charts: {
      usersByDay: usersByDay.map((row) => ({ date: dayKey(row.day), users: row.count })),
      qrsByDay: qrsByDay.map((row) => ({
        date: dayKey(row.day),
        type: row.type,
        count: row.count,
      })),
      scansByDay: scansByDay.map((row) => ({ date: dayKey(row.day), scans: row.count })),
      qrTypes: qrTypeMix,
      devices: deviceMix,
      countries,
      cities: cities.map((row) => ({
        city: `${row.city}, ${row.country}`,
        count: row.count,
      })),
      guestByDay: guestByDay.map((row) => ({ date: dayKey(row.day), guests: row.count })),
      guestTypes,
      guestSources,
      scanPoints: scanPoints.map((point) => ({
        lat: Number(point.lat),
        lng: Number(point.lng),
        city: point.city,
        country: point.country,
        count: point.count,
      })),
    },
  });
}
