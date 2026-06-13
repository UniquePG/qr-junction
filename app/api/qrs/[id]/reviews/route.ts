import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserIdFromRequest } from '@/lib/authHelper';

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

    // Verify ownership
    const qrCode = await prisma.qRCode.findUnique({
      where: { id: qrCodeId },
    });

    if (!qrCode || qrCode.userId !== userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Fetch review responses
    const reviews = await prisma.reviewResponse.findMany({
      where: { qrCodeId },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate basic stats
    const totalRatings = reviews.length;
    let averageRating = 0;
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    if (totalRatings > 0) {
      const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
      averageRating = Number((sum / totalRatings).toFixed(1));
      
      reviews.forEach(r => {
        if (r.rating >= 1 && r.rating <= 5) {
          ratingDistribution[r.rating as keyof typeof ratingDistribution]++;
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      reviews,
      stats: {
        averageRating,
        totalRatings,
        ratingDistribution,
        negativeFeedbackCount: reviews.filter(r => r.rating <= 3).length,
      }
    });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
