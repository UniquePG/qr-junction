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
    const campaignId = parseInt(id, 10);
    if (isNaN(campaignId)) {
      return NextResponse.json({ error: 'Invalid Campaign ID' }, { status: 400 });
    }

    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        userId,
      },
      include: {
        qrCodes: {
          where: {
            status: { not: QRStatus.DELETED },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Aggregate stats
    const totalScans = campaign.qrCodes.reduce((sum, qr) => sum + qr.totalScans, 0);
    const uniqueScans = campaign.qrCodes.reduce((sum, qr) => sum + qr.uniqueScans, 0);

    return NextResponse.json({
      success: true,
      campaign: {
        ...campaign,
        totalScans,
        uniqueScans,
        qrCodesCount: campaign.qrCodes.length,
      },
    });
  } catch (error: any) {
    console.error('Error fetching campaign details:', error);
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
    const campaignId = parseInt(id, 10);
    if (isNaN(campaignId)) {
      return NextResponse.json({ error: 'Invalid Campaign ID' }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        userId,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, startDate, endDate } = body;

    if (name !== undefined && (!name || typeof name !== 'string' || !name.trim())) {
      return NextResponse.json(
        { error: 'Bad Request: Campaign name cannot be empty.' },
        { status: 400 }
      );
    }

    const updated = await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        description: description !== undefined ? (description ? description.trim() : null) : undefined,
        startDate: startDate !== undefined ? (startDate ? new Date(startDate) : null) : undefined,
        endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : undefined,
      },
    });

    return NextResponse.json({ success: true, campaign: updated });
  } catch (error: any) {
    console.error('Error updating campaign:', error);
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
    const campaignId = parseInt(id, 10);
    if (isNaN(campaignId)) {
      return NextResponse.json({ error: 'Invalid Campaign ID' }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        userId,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Delete Campaign (onDelete: SetNull on QRCode handles dissociation)
    await prisma.campaign.delete({
      where: { id: campaignId },
    });

    return NextResponse.json({ success: true, message: 'Campaign deleted successfully.' });
  } catch (error: any) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
