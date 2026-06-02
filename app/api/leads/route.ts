import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserIdFromRequest } from '@/lib/authHelper';

export async function GET(request: Request) {
  try {
    const userId = await getDbUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const leads = await prisma.lead.findMany({
      where: { userId },
      include: {
        qrCode: {
          select: {
            name: true,
            type: true,
            shortCode: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, leads });
  } catch (error: any) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, qrCodeId, userId, customFields, notes } = body;

    const parsedUserId = parseInt(userId, 10);
    const parsedQrCodeId = qrCodeId ? parseInt(qrCodeId, 10) : null;

    // Validation
    if (!name || !email || isNaN(parsedUserId)) {
      return NextResponse.json(
        { error: 'Bad Request: Name, Email, and valid User ID are required.' },
        { status: 400 }
      );
    }

    // Insert lead into PostgreSQL
    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone: phone || null,
        qrCodeId: parsedQrCodeId,
        userId: parsedUserId,
        customFields: customFields || null,
        notes: notes || null,
      },
    });

    return NextResponse.json({ success: true, lead });
  } catch (error: any) {
    console.error('Error logging lead:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
