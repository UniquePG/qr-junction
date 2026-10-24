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
  const userId = Number(id);
  if (!userId) return NextResponse.json({ error: "Invalid user id." }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      restaurant: {
        include: {
          _count: { select: { menus: true, tables: true, qrCodes: true } },
        },
      },
      qrCodes: {
        where: { status: { not: "DELETED" } },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          name: true,
          type: true,
          status: true,
          shortCode: true,
          totalScans: true,
          uniqueScans: true,
          createdAt: true,
        },
      },
      campaigns: { orderBy: { createdAt: "desc" }, take: 20 },
      landingPages: { orderBy: { createdAt: "desc" }, take: 20 },
      leads: { orderBy: { createdAt: "desc" }, take: 20 },
      _count: {
        select: { qrCodes: true, campaigns: true, landingPages: true, leads: true },
      },
    },
  });

  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

  const typeCounts = user.qrCodes.reduce<Record<string, number>>((acc, qr) => {
    acc[qr.type] = (acc[qr.type] || 0) + 1;
    return acc;
  }, {});

  const reviewQrs = user.qrCodes.filter((qr) => qr.type === "REVIEW");
  const reviewStats = reviewQrs.length
    ? await prisma.reviewResponse.aggregate({
        where: { qrCodeId: { in: reviewQrs.map((qr) => qr.id) } },
        _count: { id: true },
        _avg: { rating: true },
      })
    : { _count: { id: 0 }, _avg: { rating: null } };

  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role,
      provider: user.provider,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profile: user.profile,
      restaurant: user.restaurant,
      qrCodes: user.qrCodes,
      qrTypes: typeCounts,
      scanCount: user.qrCodes.reduce((sum, qr) => sum + qr.totalScans, 0),
      campaigns: user.campaigns,
      landingPages: user.landingPages,
      leads: user.leads,
      counts: user._count,
      reviewResponses: reviewStats._count.id,
      avgRating: Number(reviewStats._avg.rating || 0),
    },
  });
}
