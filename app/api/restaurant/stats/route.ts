import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { dateFilter, parseAdminRange } from "@/lib/adminQuery";
import { getDbUserIdFromRequest } from "@/lib/authHelper";
import { prisma } from "@/lib/prisma";

const ZONE = "Asia/Kolkata";
type Bucket = "hour" | "day" | "week";

function num(value: unknown) {
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function bucketFor(isAllTime: boolean, start?: Date, end?: Date): Bucket {
  if (isAllTime || !start || !end) return "week";
  const span = end.getTime() - start.getTime();
  if (span <= 36 * 60 * 60 * 1000) return "hour";
  if (span <= 62 * 24 * 60 * 60 * 1000) return "day";
  return "week";
}

function trunc(column: Prisma.Sql, bucket: Bucket) {
  const zoned = Prisma.sql`${column} AT TIME ZONE ${ZONE}`;
  if (bucket === "hour") return Prisma.sql`date_trunc('hour', ${zoned})`;
  if (bucket === "week") return Prisma.sql`date_trunc('week', ${zoned})`;
  return Prisma.sql`date_trunc('day', ${zoned})`;
}

function bucketKey(date: Date, bucket: "hour" | "day") {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const read = (type: string) => parts.find((part) => part.type === type)?.value || "00";
  const day = `${read("year")}-${read("month")}-${read("day")}`;
  return bucket === "hour" ? `${day} ${read("hour")}:00` : day;
}

function axisLabel(key: string, bucket: Bucket) {
  if (bucket === "hour") {
    const hour = Number(key.slice(11, 13));
    return `${hour % 12 || 12} ${hour >= 12 ? "PM" : "AM"}`;
  }
  const [year, month, day] = key.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return key;
  return new Intl.DateTimeFormat("en-IN", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(year, month - 1, day)));
}

const WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

export async function GET(request: Request) {
  try {
    const userId = await getDbUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const restaurant = await prisma.restaurant.findUnique({
      where: { userId },
      select: { id: true, currency: true, orderingEnabled: true },
    });
    if (!restaurant) return NextResponse.json({ success: true, restaurant: null });

    const { searchParams } = new URL(request.url);
    const range = parseAdminRange(searchParams);
    const start = range.startDate;
    const end = range.endDate;
    const bucket = bucketFor(range.isAllTime, start, end);
    const orderRange = dateFilter(Prisma.raw(`created_at`), start, end);
    const orderRangeAliased = dateFilter(Prisma.raw(`o.created_at`), start, end);
    const scanRange = dateFilter(Prisma.raw(`s.scanned_at`), start, end);
    const qrIds = (await prisma.qRCode.findMany({
      where: { restaurantId: restaurant.id },
      select: { id: true },
    })).map((row) => row.id);

    const orderSeries = trunc(Prisma.raw(`created_at`), bucket);
    const scanSeries = trunc(Prisma.raw(`s.scanned_at`), bucket);
    const keptItems = Prisma.sql`
      i.order_id IN (
        SELECT id FROM menu_orders
        WHERE restaurant_id = ${restaurant.id}
          AND status::text <> 'REJECTED'
          ${orderRange}
      )
    `;

    const [
      totals,
      service,
      guests,
      scanTotals,
      orderDays,
      scanDays,
      weekdayRows,
      hourRows,
      categoryRows,
      dishRows,
      dietRows,
      orderPlaces,
      scanPlaces,
    ] = await Promise.all([
      prisma.$queryRaw<{ orders: number; sales: number; customers: number; paid: number; unpaid: number; rejected_orders: number; rejected_sales: number }[]>`
        SELECT
          COUNT(*) FILTER (WHERE status::text <> 'REJECTED')::int AS orders,
          COALESCE(SUM(total) FILTER (WHERE status::text <> 'REJECTED'), 0)::float AS sales,
          COUNT(DISTINCT customer_id) FILTER (WHERE status::text <> 'REJECTED')::int AS customers,
          COALESCE(SUM(total) FILTER (WHERE status::text = 'SERVED' AND paid_at IS NOT NULL), 0)::float AS paid,
          COALESCE(SUM(total) FILTER (WHERE status::text = 'SERVED' AND paid_at IS NULL), 0)::float AS unpaid,
          COUNT(*) FILTER (WHERE status::text = 'REJECTED')::int AS rejected_orders,
          COALESCE(SUM(total) FILTER (WHERE status::text = 'REJECTED'), 0)::float AS rejected_sales
        FROM menu_orders
        WHERE restaurant_id = ${restaurant.id}
        ${orderRange}
      `,
      prisma.$queryRaw<{ served: number; avg_minutes: number; under_10: number; to_20: number; to_30: number; over_30: number }[]>`
        SELECT
          COUNT(*)::int AS served,
          COALESCE(AVG(mins), 0)::float AS avg_minutes,
          COUNT(*) FILTER (WHERE mins < 10)::int AS under_10,
          COUNT(*) FILTER (WHERE mins >= 10 AND mins < 20)::int AS to_20,
          COUNT(*) FILTER (WHERE mins >= 20 AND mins < 30)::int AS to_30,
          COUNT(*) FILTER (WHERE mins >= 30)::int AS over_30
        FROM (
          SELECT EXTRACT(EPOCH FROM (MIN(e.created_at) - o.created_at)) / 60 AS mins
          FROM menu_orders o
          JOIN menu_order_events e ON e.order_id = o.id AND e.status::text = 'SERVED'
          WHERE o.restaurant_id = ${restaurant.id}
            AND o.status::text = 'SERVED'
            ${orderRangeAliased}
          GROUP BY o.id, o.created_at
        ) speeds
      `,
      prisma.$queryRaw<{ first_time: number; returning: number; items: number }[]>`
        SELECT
          COUNT(*) FILTER (WHERE visits = 1)::int AS first_time,
          COUNT(*) FILTER (WHERE visits > 1)::int AS returning,
          COALESCE((
            SELECT SUM(i.quantity)::int FROM menu_order_items i WHERE ${keptItems}
          ), 0)::int AS items
        FROM (
          SELECT customer_id, COUNT(*)::int AS visits
          FROM menu_orders
          WHERE restaurant_id = ${restaurant.id}
            AND status::text <> 'REJECTED'
            ${orderRange}
          GROUP BY customer_id
        ) guests
      `,
      qrIds.length
        ? prisma.$queryRaw<{ scans: number; guests: number }[]>`
            SELECT COUNT(*)::int AS scans, COUNT(DISTINCT s.visitor_id)::int AS guests
            FROM scans s
            WHERE s.qr_code_id IN (${Prisma.join(qrIds)})
            ${scanRange}
          `
        : Promise.resolve([{ scans: 0, guests: 0 }]),
      prisma.$queryRaw<{ bucket: string; orders: number; sales: number }[]>`
        SELECT
          to_char(${orderSeries}, 'YYYY-MM-DD HH24:00') AS bucket,
          COUNT(*) FILTER (WHERE status::text <> 'REJECTED')::int AS orders,
          COALESCE(SUM(total) FILTER (WHERE status::text <> 'REJECTED'), 0)::float AS sales
        FROM menu_orders
        WHERE restaurant_id = ${restaurant.id}
        ${orderRange}
        GROUP BY 1
        ORDER BY 1
      `,
      qrIds.length
        ? prisma.$queryRaw<{ bucket: string; scans: number }[]>`
            SELECT to_char(${scanSeries}, 'YYYY-MM-DD HH24:00') AS bucket, COUNT(*)::int AS scans
            FROM scans s
            WHERE s.qr_code_id IN (${Prisma.join(qrIds)})
            ${scanRange}
            GROUP BY 1
          `
        : Promise.resolve([]),
      prisma.$queryRaw<{ dow: number; orders: number; sales: number }[]>`
        SELECT
          EXTRACT(DOW FROM created_at AT TIME ZONE ${ZONE})::int AS dow,
          COUNT(*) FILTER (WHERE status::text <> 'REJECTED')::int AS orders,
          COALESCE(SUM(total) FILTER (WHERE status::text <> 'REJECTED'), 0)::float AS sales
        FROM menu_orders
        WHERE restaurant_id = ${restaurant.id}
        ${orderRange}
        GROUP BY 1
      `,
      prisma.$queryRaw<{ hour: number; orders: number; sales: number }[]>`
        SELECT
          EXTRACT(HOUR FROM created_at AT TIME ZONE ${ZONE})::int AS hour,
          COUNT(*) FILTER (WHERE status::text <> 'REJECTED')::int AS orders,
          COALESCE(SUM(total) FILTER (WHERE status::text <> 'REJECTED'), 0)::float AS sales
        FROM menu_orders
        WHERE restaurant_id = ${restaurant.id}
        ${orderRange}
        GROUP BY 1
      `,
      prisma.$queryRaw<{ name: string; quantity: number; sales: number }[]>`
        SELECT COALESCE(c.name, 'Uncategorised') AS name,
          SUM(i.quantity)::int AS quantity,
          COALESCE(SUM(i.quantity * i.unit_price), 0)::float AS sales
        FROM menu_order_items i
        LEFT JOIN menu_items mi ON mi.id = i.menu_item_id
        LEFT JOIN menu_categories c ON c.id = mi.category_id
        WHERE ${keptItems}
        GROUP BY 1
        ORDER BY sales DESC
        LIMIT 8
      `,
      prisma.$queryRaw<{ name: string; quantity: number; sales: number }[]>`
        SELECT i.name,
          SUM(i.quantity)::int AS quantity,
          COALESCE(SUM(i.quantity * i.unit_price), 0)::float AS sales
        FROM menu_order_items i
        WHERE ${keptItems}
        GROUP BY i.name
        ORDER BY quantity DESC, sales DESC
        LIMIT 8
      `,
      prisma.$queryRaw<{ name: string; quantity: number; sales: number }[]>`
        SELECT
          CASE
            WHEN mi.is_non_veg THEN 'Non-veg'
            WHEN mi.is_veg THEN 'Veg'
            ELSE 'Other'
          END AS name,
          SUM(i.quantity)::int AS quantity,
          COALESCE(SUM(i.quantity * i.unit_price), 0)::float AS sales
        FROM menu_order_items i
        LEFT JOIN menu_items mi ON mi.id = i.menu_item_id
        WHERE ${keptItems}
        GROUP BY 1
        ORDER BY sales DESC
      `,
      prisma.$queryRaw<{ name: string; orders: number; sales: number }[]>`
        SELECT
          COALESCE(NULLIF(table_number, ''), 'Counter') AS name,
          COUNT(*) FILTER (WHERE status::text <> 'REJECTED')::int AS orders,
          COALESCE(SUM(total) FILTER (WHERE status::text <> 'REJECTED'), 0)::float AS sales
        FROM menu_orders
        WHERE restaurant_id = ${restaurant.id}
        ${orderRange}
        GROUP BY 1
      `,
      qrIds.length
        ? prisma.$queryRaw<{ name: string; scans: number }[]>`
            SELECT COALESCE(t.table_number, 'Menu') AS name, COUNT(*)::int AS scans
            FROM scans s
            JOIN qr_codes q ON q.id = s.qr_code_id
            LEFT JOIN restaurant_tables t ON t.qr_code_id = q.id
            WHERE s.qr_code_id IN (${Prisma.join(qrIds)})
            ${scanRange}
            GROUP BY 1
          `
        : Promise.resolve([]),
    ]);

    const series = new Map<string, { sales: number; orders: number; scans: number }>();
    const take = (key: string) => {
      const normalized = bucket === "hour" ? key.slice(0, 16) : key.slice(0, 10);
      const current = series.get(normalized) || { sales: 0, orders: 0, scans: 0 };
      series.set(normalized, current);
      return current;
    };
    for (const row of orderDays) {
      const current = take(row.bucket);
      current.orders = num(row.orders);
      current.sales = num(row.sales);
    }
    for (const row of scanDays) take(row.bucket).scans = num(row.scans);

    const points = bucket === "week" || !start || !end
      ? [...series.keys()].sort()
      : [];
    if (bucket !== "week" && start && end) {
      const step = bucket === "hour" ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
      const seen = new Set<string>();
      for (let time = start.getTime(), guard = 0; time <= end.getTime() && guard < 200; time += step, guard += 1) {
        const key = bucketKey(new Date(time), bucket);
        if (!seen.has(key)) {
          seen.add(key);
          points.push(key);
        }
      }
    }

    const weekdayMap = new Map(weekdayRows.map((row) => [num(row.dow), row]));
    const hourMap = new Map(hourRows.map((row) => [num(row.hour), row]));
    const placeMap = new Map<string, { name: string; scans: number; orders: number; sales: number }>();
    for (const row of orderPlaces) {
      if (num(row.orders) <= 0 && num(row.sales) <= 0) continue;
      placeMap.set(row.name, { name: row.name, scans: 0, orders: num(row.orders), sales: num(row.sales) });
    }
    for (const row of scanPlaces) {
      const current = placeMap.get(row.name) || { name: row.name, scans: 0, orders: 0, sales: 0 };
      current.scans = num(row.scans);
      placeMap.set(row.name, current);
    }

    const total = totals[0];
    const speed = service[0];
    const sales = num(total?.sales);
    const orders = num(total?.orders);
    const pace = speed && num(speed.served) > 0 ? [
      { label: "< 10m", count: num(speed.under_10) },
      { label: "10–20", count: num(speed.to_20) },
      { label: "20–30", count: num(speed.to_30) },
      { label: "30m+", count: num(speed.over_30) },
    ] : [];

    return NextResponse.json({
      success: true,
      restaurant: { currency: restaurant.currency, orderingEnabled: restaurant.orderingEnabled },
      range: { bucket },
      summary: {
        sales,
        orders,
        average: orders > 0 ? sales / orders : 0,
        customers: num(total?.customers),
        scans: num(scanTotals[0]?.scans),
        guests: num(scanTotals[0]?.guests),
        paid: num(total?.paid),
        unpaid: num(total?.unpaid),
        rejectedOrders: num(total?.rejected_orders),
        rejectedSales: num(total?.rejected_sales),
        firstTime: num(guests[0]?.first_time),
        returning: num(guests[0]?.returning),
        items: num(guests[0]?.items),
        avgMinutes: num(speed?.avg_minutes),
        served: num(speed?.served),
      },
      series: points.map((key) => ({
        label: axisLabel(key, bucket),
        ...(series.get(key) || { sales: 0, orders: 0, scans: 0 }),
      })),
      weekdays: WEEK_ORDER.map((dow) => ({
        label: WEEK[dow].slice(0, 3),
        orders: num(weekdayMap.get(dow)?.orders),
        sales: num(weekdayMap.get(dow)?.sales),
      })),
      hours: Array.from({ length: 24 }, (_, hour) => ({
        label: `${hour % 12 || 12} ${hour >= 12 ? "PM" : "AM"}`,
        orders: num(hourMap.get(hour)?.orders),
        sales: num(hourMap.get(hour)?.sales),
      })),
      service: pace,
      categories: categoryRows.map((row) => ({ name: row.name, quantity: num(row.quantity), sales: num(row.sales) })),
      dishes: dishRows.map((row) => ({ name: row.name, quantity: num(row.quantity), sales: num(row.sales) })),
      diet: dietRows.map((row) => ({ name: row.name, quantity: num(row.quantity), sales: num(row.sales) })),
      places: [...placeMap.values()].sort((a, b) => b.sales - a.sales || b.scans - a.scans).slice(0, 8),
    });
  } catch (error) {
    console.error("Restaurant analytics error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
