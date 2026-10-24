import { NextResponse } from "next/server";
import { forbidden, requireAdmin } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin(request);
  if (!admin) return forbidden();

  const { id } = await params;
  const qrId = Number(id);
  if (!qrId) return NextResponse.json({ error: "Invalid review id." }, { status: 400 });

  const qr = await prisma.qRCode.findFirst({
    where: { id: qrId, type: "REVIEW" },
    include: {
      user: { select: { id: true, email: true, name: true } },
      reviewResponses: { orderBy: { createdAt: "desc" }, take: 100 },
    },
  });

  if (!qr) return NextResponse.json({ error: "Review campaign not found." }, { status: 404 });

  const histogram = [1, 2, 3, 4, 5].map((rating) => ({
    rating,
    count: qr.reviewResponses.filter((item) => item.rating === rating).length,
  }));

  const countBy = (key: "sentiment" | "urgency" | "category") =>
    qr.reviewResponses.reduce<Record<string, number>>((acc, item) => {
      const value = item[key] || "Unknown";
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});

  const ratings = qr.reviewResponses.map((item) => item.rating);

  return NextResponse.json({
    success: true,
    review: {
      id: qr.id,
      name: qr.name,
      shortCode: qr.shortCode,
      status: qr.status,
      destination: qr.destination,
      totalScans: qr.totalScans,
      uniqueScans: qr.uniqueScans,
      createdAt: qr.createdAt,
      owner: qr.user,
      responseCount: ratings.length,
      averageRating: ratings.length
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        : 0,
      histogram,
      sentiments: countBy("sentiment"),
      urgencies: countBy("urgency"),
      categories: countBy("category"),
      responses: qr.reviewResponses,
    },
  });
}
