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

    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (startDateParam) {
      startDate = new Date(startDateParam);
    }
    if (endDateParam) {
      endDate = new Date(endDateParam);
    }

    // Default to last 7 days if no dates provided
    if (!startDate && !endDate) {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
    }

    // 1. Fetch user's QR codes count
    const qrCodes = await prisma.qRCode.findMany({
      where: {
        userId,
        status: { not: QRStatus.DELETED },
      },
      select: {
        id: true,
      },
    });

    const totalQRs = qrCodes.length;
    const qrCodeIds = qrCodes.map((qr) => qr.id);

    // Construct where clause for timeline-specific metrics
    const scanWhere: any = {
      qrCodeId: { in: qrCodeIds },
    };
    if (startDate || endDate) {
      scanWhere.scannedAt = {};
      if (startDate) scanWhere.scannedAt.gte = startDate;
      if (endDate) scanWhere.scannedAt.lte = endDate;
    }

    const leadWhere: any = { userId };
    if (startDate || endDate) {
      leadWhere.createdAt = {};
      if (startDate) leadWhere.createdAt.gte = startDate;
      if (endDate) leadWhere.createdAt.lte = endDate;
    }

    const conversionWhere: any = {
      qrCodeId: { in: qrCodeIds },
    };
    if (startDate || endDate) {
      conversionWhere.occurredAt = {};
      if (startDate) conversionWhere.occurredAt.gte = startDate;
      if (endDate) conversionWhere.occurredAt.lte = endDate;
    }

    // 2. Fetch total and unique scans counts within date range
    const totalScans = await prisma.scan.count({
      where: scanWhere,
    });

    const uniqueScansResult = await prisma.scan.groupBy({
      by: ['visitorId'],
      where: scanWhere,
    });
    const uniqueScans = uniqueScansResult.length;

    // 3. Fetch leads count within date range
    const totalLeads = await prisma.lead.count({
      where: leadWhere,
    });

    // 4. Fetch conversions count within date range
    const totalConversions = await prisma.conversion.count({
      where: conversionWhere,
    });

    const conversionRate = totalScans > 0 ? ((totalConversions + totalLeads) / totalScans) * 100 : 0;

    // 5. Fetch scan details for breakdowns
    const scans = await prisma.scan.findMany({
      where: scanWhere,
      orderBy: {
        scannedAt: 'desc',
      },
      take: 5000, // Safe limit for visualization & browser performance
      select: {
        scannedAt: true,
        deviceType: true,
        browser: true,
        os: true,
        country: true,
        city: true,
        state: true,
        latitude: true,
        longitude: true,
        utmSource: true,
        visitorId: true,
      },
    });

    // 6. Aggregate breakdowns
    const devices: { [key: string]: number } = { DESKTOP: 0, MOBILE: 0, TABLET: 0, UNKNOWN: 0 };
    const browsers: { [key: string]: number } = {};
    const operatingSystems: { [key: string]: number } = {};
    const locations: { [key: string]: { country: string; scans: number; cities: { [key: string]: number } } } = {};
    const campaigns: { [key: string]: number } = {};

    // 7. Dynamic Trend Calculation
    const trendsMap: { [key: string]: { date: string; scans: number } } = {};
    let diffDays = 7;
    if (startDate && endDate) {
      const timeDiff = endDate.getTime() - startDate.getTime();
      diffDays = timeDiff / (1000 * 3600 * 24);
    }

    if (diffDays <= 2) {
      // Hourly intervals
      const current = new Date(startDate!);
      const endLimit = new Date(endDate!);
      while (current <= endLimit) {
        const hourStr = current.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
        const dayStr = current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const key = `${dayStr}, ${hourStr}`;
        trendsMap[key] = { date: key, scans: 0 };
        current.setHours(current.getHours() + 1);
      }
    } else if (diffDays <= 60) {
      // Daily intervals
      const current = new Date(startDate!);
      const endLimit = new Date(endDate!);
      while (current <= endLimit) {
        const key = current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        trendsMap[key] = { date: key, scans: 0 };
        current.setDate(current.getDate() + 1);
      }
    } else {
      // Weekly intervals
      const current = new Date(startDate!);
      const endLimit = new Date(endDate!);
      while (current <= endLimit) {
        const key = 'Week of ' + current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        trendsMap[key] = { date: key, scans: 0 };
        current.setDate(current.getDate() + 7);
      }
    }

    // Coordinates mapping fallbacks for major cities in case lat/lng are null
    const fallbackCityCoords: { [key: string]: { lat: number; lng: number } } = {
      'delhi': { lat: 28.6139, lng: 77.2090 },
      'new delhi': { lat: 28.6139, lng: 77.2090 },
      'mumbai': { lat: 19.0760, lng: 72.8777 },
      'bangalore': { lat: 12.9716, lng: 77.5946 },
      'bengaluru': { lat: 12.9716, lng: 77.5946 },
      'noida': { lat: 28.5355, lng: 77.3910 },
      'gurugram': { lat: 28.4595, lng: 77.0266 },
      'gurgaon': { lat: 28.4595, lng: 77.0266 },
      'hyderabad': { lat: 17.3850, lng: 78.4867 },
      'chennai': { lat: 13.0827, lng: 80.2707 },
      'kolkata': { lat: 22.5726, lng: 88.3639 },
      'pune': { lat: 18.5204, lng: 73.8567 },
      'ahmedabad': { lat: 23.0225, lng: 72.5714 },
      'jaipur': { lat: 26.9124, lng: 75.7873 },
      'lucknow': { lat: 26.8467, lng: 80.9462 },
      'london': { lat: 51.5074, lng: -0.1278 },
      'new york': { lat: 40.7128, lng: -74.0060 },
      'san francisco': { lat: 37.7749, lng: -122.4194 },
      'tokyo': { lat: 35.6762, lng: 139.6503 },
      'paris': { lat: 48.8566, lng: 2.3522 },
      'berlin': { lat: 52.5200, lng: 13.4050 },
      'singapore': { lat: 1.3521, lng: 103.8198 },
      'sydney': { lat: -33.8688, lng: 151.2093 },
      'dubai': { lat: 25.2048, lng: 55.2708 },
    };

    const scanPointsMap: { [key: string]: { lat: number; lng: number; city: string; country: string; count: number } } = {};

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

      // Trends key matching
      let scanKey = '';
      if (diffDays <= 2) {
        const scanHour = new Date(scan.scannedAt);
        scanHour.setMinutes(0, 0, 0);
        const hourStr = scanHour.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
        const dayStr = scanHour.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        scanKey = `${dayStr}, ${hourStr}`;
      } else if (diffDays <= 60) {
        scanKey = scan.scannedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else {
        const timeDiffScan = scan.scannedAt.getTime() - startDate!.getTime();
        const weekNum = Math.floor(timeDiffScan / (1000 * 3600 * 24 * 7));
        const weekStart = new Date(startDate!);
        weekStart.setDate(weekStart.getDate() + (weekNum * 7));
        scanKey = 'Week of ' + weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }

      if (trendsMap[scanKey] !== undefined) {
        trendsMap[scanKey].scans += 1;
      } else {
        trendsMap[scanKey] = { date: scanKey, scans: 1 };
      }

      // Heatmap coordinate aggregation
      let latVal = scan.latitude ? Number(scan.latitude) : null;
      let lngVal = scan.longitude ? Number(scan.longitude) : null;

      if (latVal === null || lngVal === null) {
        const cityNameClean = city.toLowerCase().trim();
        if (fallbackCityCoords[cityNameClean]) {
          latVal = fallbackCityCoords[cityNameClean].lat;
          lngVal = fallbackCityCoords[cityNameClean].lng;
        } else if (country.toLowerCase().trim() === 'india') {
          latVal = 20.5937;
          lngVal = 78.9629;
        }
      }

      if (latVal !== null && lngVal !== null) {
        // Group points slightly if they are super close (rounding to 2 decimals)
        const rLat = Math.round(latVal * 100) / 100;
        const rLng = Math.round(lngVal * 100) / 100;
        const key = `${rLat},${rLng}`;
        if (!scanPointsMap[key]) {
          scanPointsMap[key] = {
            lat: latVal,
            lng: lngVal,
            city,
            country,
            count: 0,
          };
        }
        scanPointsMap[key].count += 1;
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

    const citiesList: Array<{ name: string; country: string; value: number }> = [];
    Object.values(locations).forEach((loc) => {
      Object.entries(loc.cities).forEach(([cityName, count]) => {
        citiesList.push({
          name: cityName,
          country: loc.country,
          value: count,
        });
      });
    });

    const topCities = citiesList
      .sort((a, b) => b.value - a.value)
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
        trends: Object.values(trendsMap).sort((a, b) => {
          // Sort by date key chronologically if needed, but the loop generation already does it
          return 0;
        }),
        devices,
        browsers: formatBreakdown(browsers),
        os: formatBreakdown(operatingSystems),
        locations: formattedLocations,
        cities: topCities,
        campaigns: formatBreakdown(campaigns),
        scanPoints: Object.values(scanPointsMap),
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
