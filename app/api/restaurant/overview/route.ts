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
    const suffix = hour >= 12 ? "PM" : "AM";
    return `${hour % 12 || 12} ${suffix}`;
  }
  const [year, month, day] = key.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return key;
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function fillSeries(
  bucket: Bucket,
  start: Date | undefined,
  end: Date | undefined,
  rows: Map<string, { sales: number; orders: number; scans: number }>,
) {
  const point = (key: string) => {
    const row = rows.get(key);
    return {
      key,
      label: axisLabel(key, bucket),
      sales: row?.sales || 0,
      orders: row?.orders || 0,
      scans: row?.scans || 0,
    };
  };

  if (bucket === "week" || !start || !end) {
    return [...rows.keys()].sort().map(point);
  }

  const step = bucket === "hour" ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  const seen = new Set<string>();
  const points = [];
  for (let time = start.getTime(), guard = 0; time <= end.getTime() && guard < 200; time += step, guard += 1) {
    const key = bucketKey(new Date(time), bucket);
    if (seen.has(key)) continue;
    seen.add(key);
    points.push(point(key));
  }
  return points;
}

const hourLabel = (hour: number) => {
  const suffix = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12} ${suffix}`;
};

const STATUS_LABEL: Record<string, string> = {
  PLACED: "Placed",
  ACCEPTED: "Accepted",
  PREPARING: "Preparing",
  READY: "Ready",
  SERVED: "Served",
  REJECTED: "Rejected",
};

export async function GET(request: Request) {
  try {
    const userId = await getDbUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const restaurant = await prisma.restaurant.findUnique({
      where: { userId },
      select: { id: true, name: true, currency: true, orderingEnabled: true },
    });

    if (!restaurant) {
      return NextResponse.json({ success: true, restaurant: null });
    }

    const { searchParams } = new URL(request.url);
    const range = parseAdminRange(searchParams);
    const start = range.startDate;
    const end = range.endDate;
    const bucket = bucketFor(range.isAllTime, start, end);
    const orderRange = dateFilter(Prisma.raw(`created_at`), start, end);
    const scanRange = dateFilter(Prisma.raw(`s.scanned_at`), start, end);
    const previous = !range.isAllTime && start && end
      ? {
          end: new Date(start.getTime() - 1),
          start: new Date(start.getTime() - (end.getTime() - start.getTime())),
        }
      : null;

    const qrIds = (
      await prisma.qRCode.findMany({
        where: { restaurantId: restaurant.id },
        select: { id: true },
      })
    ).map((row) => row.id);

    const orderSeries = trunc(Prisma.raw(`created_at`), bucket);
    const scanSeries = trunc(Prisma.raw(`s.scanned_at`), bucket);

    const [
      menuCount,
      tableCount,
      totals,
      previousTotals,
      statuses,
      openRows,
      orderDays,
      scanDays,
      scanTotals,
      previousScans,
      hourRows,
      dishRows,
      placeRows,
      guestRows,
    ] = await Promise.all([
      prisma.menu.count({ where: { restaurantId: restaurant.id } }),
      prisma.restaurantTable.count({ where: { restaurantId: restaurant.id } }),
      prisma.$queryRaw<{ orders: number; sales: number; customers: number; paid: number; unpaid: number; unpaid_orders: number; rejected_orders: number; rejected_sales: number }[]>`
        SELECT
          COUNT(*) FILTER (WHERE status::text <> 'REJECTED')::int AS orders,
          COALESCE(SUM(total) FILTER (WHERE status::text <> 'REJECTED'), 0)::float AS sales,
          COUNT(DISTINCT customer_id) FILTER (WHERE status::text <> 'REJECTED')::int AS customers,
          COALESCE(SUM(total) FILTER (WHERE status::text = 'SERVED' AND paid_at IS NOT NULL), 0)::float AS paid,
          COALESCE(SUM(total) FILTER (WHERE status::text = 'SERVED' AND paid_at IS NULL), 0)::float AS unpaid,
          COUNT(*) FILTER (WHERE status::text = 'SERVED' AND paid_at IS NULL)::int AS unpaid_orders,
          COUNT(*) FILTER (WHERE status::text = 'REJECTED')::int AS rejected_orders,
          COALESCE(SUM(total) FILTER (WHERE status::text = 'REJECTED'), 0)::float AS rejected_sales
        FROM menu_orders
        WHERE restaurant_id = ${restaurant.id}
        ${orderRange}
      `,
      previous
        ? prisma.$queryRaw<{ orders: number; sales: number; scans: number }[]>`
            SELECT
              COUNT(*) FILTER (WHERE status::text <> 'REJECTED')::int AS orders,
              COALESCE(SUM(total) FILTER (WHERE status::text <> 'REJECTED'), 0)::float AS sales,
              0::int AS scans
            FROM menu_orders
            WHERE restaurant_id = ${restaurant.id}
              AND created_at >= ${previous.start}
              AND created_at <= ${previous.end}
          `
        : Promise.resolve([]),
      prisma.$queryRaw<{ status: string; count: number }[]>`
        SELECT status::text AS status, COUNT(*)::int AS count
        FROM menu_orders
        WHERE restaurant_id = ${restaurant.id}
        ${orderRange}
        GROUP BY 1
      `,
      prisma.$queryRaw<{ status: string; count: number }[]>`
        SELECT status::text AS status, COUNT(*)::int AS count
        FROM menu_orders
        WHERE restaurant_id = ${restaurant.id}
          AND status::text IN ('PLACED', 'ACCEPTED', 'PREPARING', 'READY')
        GROUP BY 1
      `,
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
            SELECT
              to_char(${scanSeries}, 'YYYY-MM-DD HH24:00') AS bucket,
              COUNT(*)::int AS scans
            FROM scans s
            WHERE s.qr_code_id IN (${Prisma.join(qrIds)})
            ${scanRange}
            GROUP BY 1
            ORDER BY 1
          `
        : Promise.resolve([]),
      qrIds.length
        ? prisma.$queryRaw<{ scans: number; guests: number }[]>`
            SELECT COUNT(*)::int AS scans, COUNT(DISTINCT s.visitor_id)::int AS guests
            FROM scans s
            WHERE s.qr_code_id IN (${Prisma.join(qrIds)})
            ${scanRange}
          `
        : Promise.resolve([{ scans: 0, guests: 0 }]),
      previous && qrIds.length
        ? prisma.$queryRaw<{ scans: number }[]>`
            SELECT COUNT(*)::int AS scans
            FROM scans s
            WHERE s.qr_code_id IN (${Prisma.join(qrIds)})
              AND s.scanned_at >= ${previous.start}
              AND s.scanned_at <= ${previous.end}
          `
        : Promise.resolve([{ scans: 0 }]),
      prisma.$queryRaw<{ hour: number; orders: number }[]>`
        SELECT
          EXTRACT(HOUR FROM created_at AT TIME ZONE ${ZONE})::int AS hour,
          COUNT(*) FILTER (WHERE status::text <> 'REJECTED')::int AS orders
        FROM menu_orders
        WHERE restaurant_id = ${restaurant.id}
        ${orderRange}
        GROUP BY 1
        ORDER BY 1
      `,
      prisma.$queryRaw<{ name: string; quantity: number; sales: number }[]>`
        SELECT
          i.name,
          SUM(i.quantity)::int AS quantity,
          COALESCE(SUM(i.quantity * i.unit_price), 0)::float AS sales
        FROM menu_order_items i
        WHERE i.order_id IN (
          SELECT id FROM menu_orders
          WHERE restaurant_id = ${restaurant.id}
            AND status::text <> 'REJECTED'
            ${orderRange}
        )
        GROUP BY i.name
        ORDER BY quantity DESC, sales DESC
        LIMIT 6
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
        ORDER BY orders DESC, sales DESC
        LIMIT 6
      `,
      prisma.$queryRaw<{ first_time: number; returning: number; items: number }[]>`
        SELECT
          COUNT(*) FILTER (WHERE visits = 1)::int AS first_time,
          COUNT(*) FILTER (WHERE visits > 1)::int AS returning,
          COALESCE((
            SELECT SUM(i.quantity)::int
            FROM menu_order_items i
            WHERE i.order_id IN (
              SELECT id FROM menu_orders
              WHERE restaurant_id = ${restaurant.id}
                AND status::text <> 'REJECTED'
                ${orderRange}
            )
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
    ]);

    const total = totals[0];
    const seriesMap = new Map<string, { sales: number; orders: number; scans: number }>();
    const remember = (key: string) => {
      const normalized = bucket === "hour" ? key.slice(0, 16) : key.slice(0, 10);
      const current = seriesMap.get(normalized) || { sales: 0, orders: 0, scans: 0 };
      seriesMap.set(normalized, current);
      return current;
    };
    for (const row of orderDays) {
      const current = remember(row.bucket);
      current.orders = num(row.orders);
      current.sales = num(row.sales);
    }
    for (const row of scanDays) {
      const current = remember(row.bucket);
      current.scans = num(row.scans);
    }

    const hourMap = new Map(hourRows.map((row) => [num(row.hour), num(row.orders)]));
    const open = { PLACED: 0, ACCEPTED: 0, PREPARING: 0, READY: 0 };
    for (const row of openRows) {
      if (row.status in open) open[row.status as keyof typeof open] = num(row.count);
    }
    const sales = num(total?.sales);
    const orders = num(total?.orders);

    return NextResponse.json({
      success: true,
      restaurant: {
        name: restaurant.name,
        currency: restaurant.currency,
        orderingEnabled: restaurant.orderingEnabled,
        menuCount,
        tableCount,
      },
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
        unpaidOrders: num(total?.unpaid_orders),
        rejectedOrders: num(total?.rejected_orders),
        rejectedSales: num(total?.rejected_sales),
        firstTime: num(guestRows[0]?.first_time),
        returning: num(guestRows[0]?.returning),
        items: num(guestRows[0]?.items),
        openNow: open.PLACED + open.ACCEPTED + open.PREPARING + open.READY,
        open,
        previous: previous
          ? {
              sales: num(previousTotals[0]?.sales),
              orders: num(previousTotals[0]?.orders),
              scans: num(previousScans[0]?.scans),
            }
          : null,
      },
      series: fillSeries(bucket, start, end, seriesMap),
      hours: Array.from({ length: 24 }, (_, hour) => ({
        hour,
        label: hourLabel(hour),
        orders: hourMap.get(hour) || 0,
      })),
      statuses: ["PLACED", "ACCEPTED", "PREPARING", "READY", "SERVED", "REJECTED"].map((status) => ({
        status,
        label: STATUS_LABEL[status],
        count: num(statuses.find((row) => row.status === status)?.count),
      })),
      dishes: dishRows.map((row) => ({ name: row.name, quantity: num(row.quantity), sales: num(row.sales) })),
      places: placeRows.filter((row) => num(row.orders) > 0).map((row) => ({
        name: row.name,
        orders: num(row.orders),
        sales: num(row.sales),
      })),
    });
  } catch (error) {
    console.error("Restaurant overview error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
