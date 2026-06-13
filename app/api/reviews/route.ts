import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { qrCodeId, rating, feedback, name, phone } = body;

    if (!qrCodeId || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Bad Request: qrCodeId and valid rating are required.' },
        { status: 400 }
      );
    }

    // Save the review
    const reviewResponse = await prisma.reviewResponse.create({
      data: {
        qrCodeId,
        rating,
        feedback,
        name,
        phone,
      },
    });

    // We can also trigger notifications here later (Email / WhatsApp)

    return NextResponse.json({ success: true, reviewResponse });
  } catch (error: any) {
    console.error('Error submitting review:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
