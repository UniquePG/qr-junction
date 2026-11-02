import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { allows } from '@/lib/billing/guard';

export async function GET(
  request: Request,
  { params }: { params: Promise<any> }
) {
  try {
    const { shortCode } = await params;

    const qrCode = await prisma.qRCode.findUnique({
      where: { shortCode },
      select: {
        id: true,
        type: true,
        destination: true,
        fgColor: true,
        bgColor: true,
        logoUrl: true,
        status: true,
        userId: true,
      }
    });

    if (!qrCode || qrCode.status === 'DELETED') {
      return NextResponse.json({ error: 'QR Code not found' }, { status: 404 });
    }

    if (qrCode.status === 'PAUSED') {
      return NextResponse.json({ error: 'QR Code paused' }, { status: 403 });
    }

    const [aiSuggestions, smartRedirect] = await Promise.all([
      allows(qrCode.userId, 'reviews.ai_suggestions'),
      allows(qrCode.userId, 'reviews.smart_redirect'),
    ]);
    const { userId: _userId, ...publicQr } = qrCode;
    return NextResponse.json({
      success: true,
      qrCode: { ...publicQr, plan: { aiSuggestions, smartRedirect } },
    });
  } catch (error: any) {
    console.error('Error fetching public QR code:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
