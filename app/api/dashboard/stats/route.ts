import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserIdFromRequest } from '@/lib/authHelper';
import { QRStatus } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const userId = await getDbUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch user's QR codes count and scans
    const qrCodes = await prisma.qRCode.findMany({
      where: {
        userId,
        status: { not: QRStatus.DELETED },
      },
      select: {
        id: true,
        totalScans: true,
        uniqueScans: true,
      },
    });

    const totalQRs = qrCodes.length;
    const totalScans = qrCodes.reduce((sum, qr) => sum + qr.totalScans, 0);
    const uniqueScans = qrCodes.reduce((sum, qr) => sum + qr.uniqueScans, 0);

    // 2. Fetch leads count
    const totalLeads = await prisma.lead.count({
      where: { userId },
    });

    // 3. Fetch conversions count
    const qrCodeIds = qrCodes.map((qr) => qr.id);
    const totalConversions = await prisma.conversion.count({
      where: {
        qrCodeId: { in: qrCodeIds },
      },
    });

    const conversionRate = totalScans > 0 ? ((totalConversions + totalLeads) / totalScans) * 100 : 0;

    // 4. Fetch scan details for breakdowns (limit to last 1000 for performance, or all if small)
    const scans = await prisma.scan.findMany({
      where: {
        qrCodeId: { in: qrCodeIds },
      },
      orderBy: {
        scannedAt: 'desc',
      },
      take: 2000,
      select: {
        scannedAt: true,
        deviceType: true,
        browser: true,
        os: true,
        country: true,
        city: true,
        utmSource: true,
      },
    });

    // 5. Aggregate breakdowns
    const devices: { [key: string]: number } = { DESKTOP: 0, MOBILE: 0, TABLET: 0, UNKNOWN: 0 };
    const browsers: { [key: string]: number } = {};
    const operatingSystems: { [key: string]: number } = {};
    const locations: { [key: string]: { country: string; scans: number; cities: { [key: string]: number } } } = {};
    const campaigns: { [key: string]: number } = {};

    // Build past 7 days map for trends
    const trendsMap: { [key: string]: { date: string; scans: number } } = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      trendsMap[dateStr] = { date: dateStr, scans: 0 };
    }

    scans.forEach((scan) => {
      // Device
      const dev = scan.deviceType || 'UNKNOWN';
      devices[dev] = (devices[dev] || 0) + 1;

      // Browser
      const br = scan.browser || 'Unknown';
      browsers[br] = (browsers[br] || 0) + 1;

      // OS
      const sys = scan.os || 'Unknown';
      operatingSystems[sys] = (operatingSystems[sys] || 0) + 1;

      // Location
      const country = scan.country || 'Unknown';
      const city = scan.city || 'Unknown';
      if (!locations[country]) {
        locations[country] = { country, scans: 0, cities: {} };
      }
      locations[country].scans += 1;
      locations[country].cities[city] = (locations[country].cities[city] || 0) + 1;

      // Campaign UTM
      const utm = scan.utmSource || 'Direct';
      campaigns[utm] = (campaigns[utm] || 0) + 1;

      // Trends (format date to match trendsMap keys)
      const scanDateStr = scan.scannedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (trendsMap[scanDateStr] !== undefined) {
        trendsMap[scanDateStr].scans += 1;
      }
    });

    // Formatting breakdowns for client
    const formatBreakdown = (obj: { [key: string]: number }) => {
      return Object.entries(obj)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
    };

    const formattedLocations = Object.values(locations)
      .map((loc) => ({
        country: loc.country,
        scans: loc.scans,
        topCities: Object.entries(loc.cities)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 3),
      }))
      .sort((a, b) => b.scans - a.scans)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      stats: {
        totalQRs,
        totalScans,
        uniqueScans,
        totalLeads,
        totalConversions,
        conversionRate: parseFloat(conversionRate.toFixed(1)),
        trends: Object.values(trendsMap),
        devices,
        browsers: formatBreakdown(browsers),
        os: formatBreakdown(operatingSystems),
        locations: formattedLocations,
        campaigns: formatBreakdown(campaigns),
      },
    });
  } catch (error: any) {
    console.error('Error calculating dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
