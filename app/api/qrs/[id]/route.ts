import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserIdFromRequest } from '@/lib/authHelper';
import { QRStatus } from '@prisma/client';

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

    const {
      name,
      destination,
      status,
      fgColor,
      bgColor,
      logoUrl,
      utmSource,
      utmMedium,
      utmCampaign,
    } = body;

    // Update fields
    const updated = await prisma.qRCode.update({
      where: { id: qrCodeId },
      data: {
        name: name || undefined,
        destination: destination || undefined,
        status: status || undefined,
        fgColor: fgColor || undefined,
        bgColor: bgColor || undefined,
        logoUrl: logoUrl !== undefined ? logoUrl : undefined,
        utmSource: utmSource !== undefined ? utmSource : undefined,
        utmMedium: utmMedium !== undefined ? utmMedium : undefined,
        utmCampaign: utmCampaign !== undefined ? utmCampaign : undefined,
      },
    });

    return NextResponse.json({ success: true, qrCode: updated });
  } catch (error: any) {
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
