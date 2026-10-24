import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { forbidden, requireAdmin } from "@/lib/adminAuth";
import { paginationMeta, parsePagination } from "@/lib/adminQuery";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return forbidden();

  const { searchParams } = new URL(request.url);
  const { page, pageSize, skip } = parsePagination(searchParams);
  const search = (searchParams.get("search") || "").trim();

  const where: Prisma.QRCodeWhereInput = {
    type: "REVIEW",
    status: { not: "DELETED" },
  };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { user: { email: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [total, qrs] = await Promise.all([
    prisma.qRCode.count({ where }),
    prisma.qRCode.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        shortCode: true,
        status: true,
        totalScans: true,
        uniqueScans: true,
        createdAt: true,
        destination: true,
        user: { select: { id: true, email: true, name: true } },
      },
    }),
  ]);

  const qrIds = qrs.map((qr) => qr.id);
  const reviewAgg = qrIds.length
    ? await prisma.reviewResponse.groupBy({
        by: ["qrCodeId"],
        where: { qrCodeId: { in: qrIds } },
        _count: { id: true },
        _avg: { rating: true },
        _max: { createdAt: true },
      })
    : [];
  const statsByQr = new Map(reviewAgg.map((row) => [row.qrCodeId, row]));

  return NextResponse.json({
    success: true,
    ...paginationMeta(total, page, pageSize),
    reviews: qrs.map((qr) => {
      const dest = (qr.destination || {}) as { businessName?: string };
      const stats = statsByQr.get(qr.id);
      return {
        id: qr.id,
        name: qr.name,
        businessName: dest.businessName || qr.name,
        shortCode: qr.shortCode,
        status: qr.status,
        totalScans: qr.totalScans,
        uniqueScans: qr.uniqueScans,
        createdAt: qr.createdAt,
        owner: qr.user,
        responseCount: stats?._count.id || 0,
        averageRating: Number(stats?._avg.rating || 0),
        lastResponseAt: stats?._max.createdAt || null,
      };
    }),
  });
}
