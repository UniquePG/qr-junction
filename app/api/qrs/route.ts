import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserIdFromRequest } from '@/lib/authHelper';
import { generateUniqueShortCode } from '@/utils/shortCode';
import { QRType, QRStatus } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const userId = await getDbUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const qrCodes = await prisma.qRCode.findMany({
      where: {
        userId,
        status: { not: QRStatus.DELETED },
      },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, qrCodes });
  } catch (error: any) {
    console.error('Error fetching QR codes:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getDbUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const { 
      name, 
      type, 
      destination, 
      fgColor, 
      bgColor, 
      logoUrl, 
      utmSource, 
      utmMedium, 
      utmCampaign,
      campaignId,
      landingPageId
    } = body;

    // Validation
    if (!name || !type || !destination) {
      return NextResponse.json(
        { error: 'Bad Request: Name, Type, and Destination are required.' },
        { status: 400 }
      );
    }

    if (!Object.values(QRType).includes(type)) {
      return NextResponse.json(
        { error: `Bad Request: Invalid QR Type. Must be one of: ${Object.values(QRType).join(', ')}` },
        { status: 400 }
      );
    }

    // Generate short code
    const shortCode = await generateUniqueShortCode();

    // Parse IDs
    const parsedCampaignId = campaignId ? parseInt(campaignId, 10) : null;
    const finalLandingPageId = landingPageId || (destination as any)?.landingPageId;
    const parsedLandingPageId = finalLandingPageId ? parseInt(finalLandingPageId, 10) : null;

    // Create the QR Code
    const qrCode = await prisma.qRCode.create({
      data: {
        name,
        type,
        shortCode,
        destination, // Expects JSON object matching destination structure
        userId,
        campaignId: isNaN(parsedCampaignId as number) ? null : parsedCampaignId,
        landingPageId: isNaN(parsedLandingPageId as number) ? null : parsedLandingPageId,
        fgColor: fgColor || '#000000',
        bgColor: bgColor || '#FFFFFF',
        logoUrl: logoUrl || null,
        utmSource: utmSource || null,
        utmMedium: utmMedium || null,
        utmCampaign: utmCampaign || null,
        status: QRStatus.ACTIVE,
      },
    });

    return NextResponse.json({ success: true, qrCode });
  } catch (error: any) {
    console.error('Error creating QR code:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
