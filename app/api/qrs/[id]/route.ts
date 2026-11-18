import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserIdFromRequest } from '@/lib/authHelper';
import { QRStatus } from '@prisma/client';
import {
  RestaurantAccessError,
  requireAnyRestaurantPermission,
  resolveRestaurantContext,
} from '@/lib/restaurant/access';
import { auditFromContext, clientIp } from '@/lib/restaurant/audit';

export async function GET(
  request: Request,
  { params }: { params: Promise<any> }
) {
  try {
    const userId = await getDbUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const qrCodeId = parseInt(id, 10);
    if (isNaN(qrCodeId)) {
      return NextResponse.json({ error: 'Invalid QR Code ID' }, { status: 400 });
    }

    const qrCode = await prisma.qRCode.findFirst({
      where: {
        id: qrCodeId,
        userId,
        status: { not: QRStatus.DELETED },
      },
      include: {
        campaign: true,
      },
    });

    if (!qrCode) {
      return NextResponse.json({ error: 'QR Code not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, qrCode });
  } catch (error: any) {
    console.error('Error fetching QR code details:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<any> }
) {
  try {
    const userId = await getDbUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const qrCodeId = parseInt(id, 10);
    if (isNaN(qrCodeId)) {
      return NextResponse.json({ error: 'Invalid QR Code ID' }, { status: 400 });
    }

    const body = await request.json();

    // Check ownership and existence
    let existing = await prisma.qRCode.findFirst({
      where: {
        id: qrCodeId,
        userId,
        status: { not: QRStatus.DELETED },
      },
    });

    // Restaurant staff may restyle the venue's table / menu QR codes (design fields only).
    let staffDesignOnly = false;
    const restaurantCtx = await resolveRestaurantContext(userId);
    if (!existing && restaurantCtx?.kind === 'staff') {
      const venueQr = await prisma.qRCode.findFirst({
        where: {
          id: qrCodeId,
          restaurantId: restaurantCtx.restaurant.id,
          status: { not: QRStatus.DELETED },
        },
      });
      if (venueQr) {
        requireAnyRestaurantPermission(restaurantCtx, ['tables.manage', 'menu.update']);
        existing = venueQr;
        staffDesignOnly = true;
      }
    }

    if (!existing) {
      return NextResponse.json({ error: 'QR Code not found' }, { status: 404 });
    }

    const {
      name,
      destination,
      status,
      fgColor,
      bgColor,
      logoUrl,
      customDesign,
      utmSource,
      utmMedium,
      utmCampaign,
      campaignId,
      landingPageId,
    } = body;

    // Parse campaign ID if provided
    const parsedCampaignId = campaignId !== undefined 
      ? (campaignId ? parseInt(campaignId, 10) : null) 
      : undefined;

    // Parse landing page ID if provided
    const finalLandingPageId = landingPageId !== undefined
      ? landingPageId
      : (destination?.landingPageId !== undefined ? destination.landingPageId : undefined);
    const parsedLandingPageId = finalLandingPageId !== undefined
      ? (finalLandingPageId ? parseInt(finalLandingPageId, 10) : null)
      : undefined;

    // Update fields
    const updated = await prisma.qRCode.update({
      where: { id: qrCodeId },
      data: {
        name: staffDesignOnly ? undefined : name || undefined,
        destination: staffDesignOnly ? undefined : destination || undefined,
        status: staffDesignOnly ? undefined : status || undefined,
        fgColor: fgColor || undefined,
        bgColor: bgColor || undefined,
        logoUrl: logoUrl !== undefined ? logoUrl : undefined,
        customDesign: customDesign !== undefined ? customDesign : undefined,
        utmSource: utmSource !== undefined ? utmSource : undefined,
        utmMedium: utmMedium !== undefined ? utmMedium : undefined,
        utmCampaign: utmCampaign !== undefined ? utmCampaign : undefined,
        campaignId: parsedCampaignId !== undefined 
          ? (parsedCampaignId && isNaN(parsedCampaignId) ? null : parsedCampaignId) 
          : undefined,
        landingPageId: parsedLandingPageId !== undefined
          ? (parsedLandingPageId && isNaN(parsedLandingPageId) ? null : parsedLandingPageId)
          : undefined,
      },
    });

    if (restaurantCtx && existing.restaurantId === restaurantCtx.restaurant.id) {
      const changed: string[] = [];
      if (fgColor || bgColor) changed.push('colors');
      if (logoUrl !== undefined) changed.push('logo');
      if (customDesign !== undefined) changed.push('frame/style');
      auditFromContext(restaurantCtx, {
        action: 'qr.design',
        resourceType: 'qr_code',
        resourceId: updated.id,
        summary: `Updated QR design “${updated.name}”${changed.length ? ` (${changed.join(', ')})` : ''}`,
        meta: { changed },
        ip: clientIp(request),
      });
    }

    return NextResponse.json({ success: true, qrCode: updated });
  } catch (error: any) {
    if (error instanceof RestaurantAccessError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    }
    console.error('Error updating QR code:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<any> }
) {
  try {
    const userId = await getDbUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const qrCodeId = parseInt(id, 10);
    if (isNaN(qrCodeId)) {
      return NextResponse.json({ error: 'Invalid QR Code ID' }, { status: 400 });
    }

    // Check ownership
    const existing = await prisma.qRCode.findFirst({
      where: {
        id: qrCodeId,
        userId,
        status: { not: QRStatus.DELETED },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'QR Code not found' }, { status: 404 });
    }

    // Soft delete
    await prisma.qRCode.update({
      where: { id: qrCodeId },
      data: {
        status: QRStatus.DELETED,
      },
    });

    return NextResponse.json({ success: true, message: 'QR Code deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting QR code:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
