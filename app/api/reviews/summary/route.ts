import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserIdFromRequest } from '@/lib/authHelper';
import { QRType, QRStatus } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const userId = await getDbUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Get all review QR codes of the user
    const reviewQrs = await prisma.qRCode.findMany({
      where: {
        userId,
        type: QRType.REVIEW,
        status: { not: QRStatus.DELETED },
      },
      include: {
        reviewResponses: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 2. Aggregate stats
    let totalRatings = 0;
    let sumRatings = 0;
    let negativeFeedbackCount = 0;
    const allReviewsList: any[] = [];

    const formattedQrs = reviewQrs.map((qr) => {
      const qrReviews = qr.reviewResponses;
      const qrTotalRatings = qrReviews.length;
      let qrAverageRating = 0;
      
      if (qrTotalRatings > 0) {
        const qrSum = qrReviews.reduce((sum, r) => sum + r.rating, 0);
        qrAverageRating = Number((qrSum / qrTotalRatings).toFixed(1));
        
        totalRatings += qrTotalRatings;
        sumRatings += qrSum;
        negativeFeedbackCount += qrReviews.filter(r => r.rating <= 3).length;

        qrReviews.forEach((r) => {
          allReviewsList.push({
            id: r.id,
            qrCodeId: qr.id,
            qrName: qr.name,
            businessName: (qr.destination as any)?.businessName || qr.name,
            rating: r.rating,
            feedback: r.feedback,
            name: r.name,
            phone: r.phone,
            createdAt: r.createdAt,
          });
        });
      }

      return {
        id: qr.id,
        shortCode: qr.shortCode,
        name: qr.name,
        status: qr.status,
        destination: qr.destination,
        fgColor: qr.fgColor,
        bgColor: qr.bgColor,
        totalScans: qr.totalScans,
        uniqueScans: qr.uniqueScans,
        createdAt: qr.createdAt,
        totalRatings: qrTotalRatings,
        averageRating: qrAverageRating,
      };
    });

    const averageRating = totalRatings > 0 ? Number((sumRatings / totalRatings).toFixed(1)) : 0;

    // Sort all reviews by date desc
    allReviewsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      qrCodes: formattedQrs,
      reviews: allReviewsList,
      stats: {
        averageRating,
        totalRatings,
        negativeFeedbackCount,
      },
    });
  } catch (error: any) {
    console.error('Error fetching review suite stats:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
