import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserIdFromRequest } from '@/lib/authHelper';

export async function GET(request: Request) {
  try {
    const userId = await getDbUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const campaigns = await prisma.campaign.findMany({
      where: { userId },
      include: {
        _count: {
          select: { qrCodes: true },
        },
        qrCodes: {
          select: {
            totalScans: true,
            uniqueScans: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedCampaigns = campaigns.map((camp) => {
      const qrCodesCount = camp._count.qrCodes;
      const totalScans = camp.qrCodes.reduce((sum, qr) => sum + qr.totalScans, 0);
      const uniqueScans = camp.qrCodes.reduce((sum, qr) => sum + qr.uniqueScans, 0);

      return {
        id: camp.id,
        name: camp.name,
        description: camp.description,
        startDate: camp.startDate,
        endDate: camp.endDate,
        createdAt: camp.createdAt,
        qrCodesCount,
        totalScans,
        uniqueScans,
      };
    });

    return NextResponse.json({ success: true, campaigns: formattedCampaigns });
  } catch (error: any) {
    console.error('Error fetching campaigns:', error);
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
    const { name, description, startDate, endDate } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'Bad Request: Campaign name is required.' },
        { status: 400 }
      );
    }

    const campaign = await prisma.campaign.create({
      data: {
        name: name.trim(),
        description: description ? description.trim() : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        userId,
      },
    });

    return NextResponse.json({ success: true, campaign });
  } catch (error: any) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
