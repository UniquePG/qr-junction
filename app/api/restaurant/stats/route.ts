import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserIdFromRequest } from '@/lib/authHelper';

export async function GET(request: Request) {
  try {
    const userId = await getDbUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    let startDate = new Date();
    startDate.setDate(startDate.getDate() - 7); // Default to last 7 days
    if (startDateParam) startDate = new Date(startDateParam);

    let endDate = new Date();
    if (endDateParam) endDate = new Date(endDateParam);

    // Fetch all restaurant QR codes with scans within range
    const qrCodes = await prisma.qRCode.findMany({
      where: {
        userId,
        type: 'RESTAURANT_MENU',
      },
      include: {
        scans: {
          where: {
            scannedAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          orderBy: { scannedAt: 'asc' },
        },
        restaurantTable: true,
      },
    });

    // Compile statistics
    let totalScans = 0;
    const uniqueVisitorsSet = new Set<string>();
    const devices = { MOBILE: 0, DESKTOP: 0, TABLET: 0, UNKNOWN: 0 };
    const tablePerformanceMap: Record<string, { scans: number; unique: number }> = {};
    const trendsMap: Record<string, number> = {};

    // Helper to format date for trend chart (YYYY-MM-DD)
    const formatDateKey = (date: Date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    qrCodes.forEach((qr) => {
      const label = qr.restaurantTable ? qr.restaurantTable.tableNumber : 'Main QR (No Table)';
      if (!tablePerformanceMap[label]) {
        tablePerformanceMap[label] = { scans: 0, unique: 0 };
      }

      const tableUniqueSet = new Set<string>();

      qr.scans.forEach((scan) => {
        totalScans++;
        uniqueVisitorsSet.add(scan.visitorId);
        tableUniqueSet.add(scan.visitorId);

        // Devices
        const device = scan.deviceType || 'UNKNOWN';
        devices[device] = (devices[device] || 0) + 1;

        // Table performance
        tablePerformanceMap[label].scans++;

        // Trends
        const dateKey = formatDateKey(scan.scannedAt);
        trendsMap[dateKey] = (trendsMap[dateKey] || 0) + 1;
      });

      tablePerformanceMap[label].unique = tableUniqueSet.size;
    });

    // Format trends as array
    const trends = Object.keys(trendsMap).map((date) => ({
      date,
      scans: trendsMap[date],
    })).sort((a, b) => a.date.localeCompare(b.date));

    // Format table performance as array
    const tablePerformance = Object.keys(tablePerformanceMap).map((name) => ({
      name,
      scans: tablePerformanceMap[name].scans,
      unique: tablePerformanceMap[name].unique,
    })).sort((a, b) => b.scans - a.scans); // Sort by highest scans

    return NextResponse.json({
      success: true,
      stats: {
        totalScans,
        uniqueScans: uniqueVisitorsSet.size,
        devices,
        tablePerformance,
        trends,
      },
    });
  } catch (error: any) {
    console.error('Restaurant stats API error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
