import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ConversionEventType } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { qrCodeId, eventType, eventName, value, currency } = body;

    const parsedQrCodeId = parseInt(qrCodeId, 10);

    // Validation
    if (isNaN(parsedQrCodeId) || !eventType) {
      return NextResponse.json(
        { error: 'Bad Request: Valid QR Code ID and Event Type are required.' },
        { status: 400 }
      );
    }

    // Verify eventType is a valid ConversionEventType enum value
    if (!Object.values(ConversionEventType).includes(eventType)) {
      return NextResponse.json(
        { error: `Bad Request: Invalid Event Type. Must be one of: ${Object.values(ConversionEventType).join(', ')}` },
        { status: 400 }
      );
    }

    // Create conversion entry
    const conversion = await prisma.conversion.create({
      data: {
        qrCodeId: parsedQrCodeId,
        eventType,
        eventName: eventName || null,
        value: value ? parseFloat(value.toString()) : null,
        currency: currency || 'INR',
      },
    });

    return NextResponse.json({ success: true, conversion });
  } catch (error: any) {
    console.error('Error logging conversion:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
