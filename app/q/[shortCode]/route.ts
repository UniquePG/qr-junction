import { NextRequest, NextResponse, userAgent } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveGeoLocation } from '@/lib/geo';
import { DeviceType } from '@prisma/client';
import { qrPausedTemplate, qrTextTemplate } from '@/lib/HtmlTemplates/htmlTemplates';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<any> }
) {
  try {
    const { shortCode } = await params;

    // 1. Look up the QR Code
    const qrCode = await prisma.qRCode.findUnique({
      where: { shortCode },
    });

    // Handle not found, paused, or deleted
    if (!qrCode || qrCode.status === 'DELETED') {
      return new NextResponse('QR Code not found', { status: 404 });
    }

    if (qrCode.status === 'PAUSED') {
      return new NextResponse(
        qrPausedTemplate(),
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    // 2. Determine visitor uniqueness using a long-lived cookie
    let visitorId = request.cookies.get('qrj_visitor_id')?.value;
    let isUnique = false;

    if (!visitorId) {
      // Generate a simple, unique visitor ID
      visitorId = `vis_${Math.random().toString(36).substring(2, 15)}_${Date.now().toString(36)}`;
      isUnique = true;
    }

    // 3. User-Agent parsing via Next.js helper
    const ua = userAgent(request);
    let matchedDevice: DeviceType = DeviceType.DESKTOP;

    if (ua.device.type === 'mobile') {
      matchedDevice = DeviceType.MOBILE;
    } else if (ua.device.type === 'tablet') {
      matchedDevice = DeviceType.TABLET;
    } else if (ua.device.type) {
      matchedDevice = DeviceType.UNKNOWN;
    }

    const browser = ua.browser.name || 'Unknown';
    const os = ua.os.name || 'Unknown';
    const rawUserAgent = request.headers.get('user-agent') || 'Unknown';

    // 4. Geolocation mapping
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
    const geo = await resolveGeoLocation(clientIp, request.headers);

    // 5. Campaign/UTM attributes
    const urlObj = new URL(request.url);
    const utmSource = urlObj.searchParams.get('utm_source') || qrCode.utmSource || 'qr_junction';
    const utmMedium = urlObj.searchParams.get('utm_medium') || qrCode.utmMedium || 'qr_scan';
    const utmCampaign = urlObj.searchParams.get('utm_campaign') || qrCode.utmCampaign || qrCode.name;
    const referer = request.headers.get('referer') || request.headers.get('referrer') || null;

    // 6. Log Scan and increment totals in database
    await prisma.$transaction([
      prisma.scan.create({
        data: {
          qrCodeId: qrCode.id,
          visitorId,
          deviceType: matchedDevice,
          browser,
          os,
          userAgent: rawUserAgent,
          ipAddress: clientIp,
          country: geo.country,
          city: geo.city,
          state: geo.state,
          latitude: geo.latitude,
          longitude: geo.longitude,
          referer,
          utmSource,
          utmMedium,
          utmCampaign,
        },
      }),
      prisma.qRCode.update({
        where: { id: qrCode.id },
        data: {
          totalScans: { increment: 1 },
          uniqueScans: isUnique ? { increment: 1 } : undefined,
        },
      }),
    ]);

    // 7. Resolve dynamic destination mapping
    const dest = qrCode.destination as any;
    let redirectUrl = '';
    let response: NextResponse | null = null;

    if (qrCode.type === 'URL') {
      redirectUrl = dest.url || '/';
    } else if (qrCode.type === 'LANDING_PAGE') {
      if (qrCode.landingPageId) {
        const landingPage = await prisma.landingPage.findUnique({
          where: { id: qrCode.landingPageId },
        });
        if (landingPage) {
          redirectUrl = `/p/${landingPage.slug}?qrCodeId=${qrCode.id}&utm_source=${utmSource}&utm_medium=${utmMedium}&utm_campaign=${utmCampaign}`;
        } else {
          redirectUrl = '/';
        }
      } else {
        redirectUrl = '/';
      }
    } else if (qrCode.type === 'TEXT') {
      response = new NextResponse(qrTextTemplate(dest.text || ''), {
        headers: { 'Content-Type': 'text/html' },
      });
    } else if (qrCode.type === 'WHATSAPP') {
      redirectUrl = `https://wa.me/${dest.phone}?text=${encodeURIComponent(dest.message || '')}`;
    } else if (qrCode.type === 'EMAIL') {
      redirectUrl = `mailto:${dest.email}?subject=${encodeURIComponent(dest.subject || '')}&body=${encodeURIComponent(dest.body || '')}`;
    } else if (qrCode.type === 'PHONE') {
      redirectUrl = `tel:${dest.phone}`;
    } else if (qrCode.type === 'WIFI') {
      // Direct connection parameters are static. For dynamic tracking we redirect to a client details page.
      redirectUrl = `/q/${shortCode}/wifi`;
    } else if (qrCode.type === 'SNAPCHAT') {
      redirectUrl = `https://snapchat.com/add/${dest.username || ''}`;
    } else if (qrCode.type === 'INSTAGRAM') {
      redirectUrl = `https://instagram.com/${dest.username || ''}`;
    } else if (qrCode.type === 'FACEBOOK') {
      redirectUrl = `https://facebook.com/${dest.username || ''}`;
    } else if (qrCode.type === 'TWITTER') {
      redirectUrl = `https://twitter.com/${dest.username || ''}`;
    } else if (qrCode.type === 'LINKEDIN') {
      redirectUrl = dest.type === 'profile' 
        ? `https://linkedin.com/in/${dest.username || ''}` 
        : `https://linkedin.com/company/${dest.username || ''}`;
    } else if (qrCode.type === 'TELEGRAM') {
      redirectUrl = dest.type === 'user'
        ? `https://t.me/${dest.username || ''}`
        : dest.type === 'group'
          ? `https://t.me/joinchat/${dest.username || ''}`
          : `https://t.me/s/${dest.username || ''}`;
    } else if (qrCode.type === 'SMS') {
      redirectUrl = `sms:${dest.phone}?body=${encodeURIComponent(dest.message || '')}`;
    } else if (qrCode.type === 'CONTACT') {
      // vCard direct download
      let v = 'BEGIN:VCARD\nVERSION:3.0\n';
      if (dest.name) v += `FN:${dest.name}\n`;
      if (dest.phone) v += `TEL:${dest.phone}\n`;
      if (dest.email) v += `EMAIL:${dest.email}\n`;
      if (dest.address) v += `ADR:;;${dest.address};;;\n`;
      if (dest.website) v += `URL:${dest.website}\n`;
      v += 'END:VCARD';

      response = new NextResponse(v, {
        headers: {
          'Content-Type': 'text/vcard',
          'Content-Disposition': 'attachment; filename="contact.vcf"',
        },
      });
    } else if (qrCode.type === 'APP_DOWNLOAD') {
      // Dynamic OS redirecting
      if (os === 'iOS' || os === 'Mac OS') {
        redirectUrl = dest.iosUrl || dest.fallbackUrl || '/';
      } else if (os === 'Android') {
        redirectUrl = dest.androidUrl || dest.fallbackUrl || '/';
      } else {
        redirectUrl = dest.fallbackUrl || '/';
      }
    } else if (qrCode.type === 'REVIEW') {
      // Route to dynamic review landing page
      redirectUrl = `/q/${shortCode}/review?utm_source=${utmSource}&utm_medium=${utmMedium}&utm_campaign=${utmCampaign}`;
    } else {
      // Fallback
      redirectUrl = dest.url || '/';
    }

    if (!response) {
      response = NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    // Set cookie if unique
    if (isUnique) {
      response.cookies.set('qrj_visitor_id', visitorId, {
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/',
        sameSite: 'lax',
        secure: true,
      });
    }

    return response;
  } catch (error: any) {
    console.error('Redirection error:', error);
    return new NextResponse('Internal Redirection Error', { status: 500 });
  }
}
