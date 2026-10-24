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
  const role = searchParams.get("role") || "";
  const provider = searchParams.get("provider") || "";
  const verified = searchParams.get("verified");

  const where: Prisma.UserWhereInput = {};
  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { name: { contains: search, mode: "insensitive" } },
    ];
  }
  if (role && ["USER", "ADMIN", "OWNER"].includes(role)) {
    where.role = role as Prisma.EnumUserRoleFilter["equals"];
  }
  if (provider) where.provider = provider;
  if (verified === "true") where.emailVerified = true;
  if (verified === "false") where.emailVerified = false;

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        provider: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { leads: true, campaigns: true, landingPages: true },
        },
      },
    }),
  ]);

  const userIds = users.map((user) => user.id);
  const [qrAgg, lastScans] = userIds.length
    ? await Promise.all([
        prisma.qRCode.groupBy({
          by: ["userId"],
          where: { userId: { in: userIds }, status: { not: "DELETED" } },
          _sum: { totalScans: true },
          _count: { id: true },
        }),
        prisma.$queryRaw<{ user_id: number; last_scan: Date | null }[]>`
          SELECT q.user_id, MAX(s.scanned_at) AS last_scan
          FROM qr_codes q
          JOIN scans s ON s.qr_code_id = q.id
          WHERE q.user_id IN (${Prisma.join(userIds)})
          GROUP BY q.user_id
        `,
      ])
    : [[], []];

  const qrByUser = new Map(qrAgg.map((row) => [row.userId, row]));
  const lastScanByUser = new Map(lastScans.map((row) => [row.user_id, row.last_scan]));

  return NextResponse.json({
    success: true,
    ...paginationMeta(total, page, pageSize),
    users: users.map((user) => {
      const qr = qrByUser.get(user.id);
      const lastScan = lastScanByUser.get(user.id);
      const lastActive =
        lastScan && lastScan > user.updatedAt ? lastScan : user.updatedAt;
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: user.role,
        provider: user.provider,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastActive,
        qrCount: qr?._count.id || 0,
        scanCount: qr?._sum.totalScans || 0,
        leadCount: user._count.leads,
        campaignCount: user._count.campaigns,
        pageCount: user._count.landingPages,
      };
    }),
  });
}
