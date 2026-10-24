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

  const where: Prisma.LandingPageWhereInput = {};
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
      { user: { email: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [total, pages] = await Promise.all([
    prisma.landingPage.count({ where }),
    prisma.landingPage.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, email: true, name: true } },
        _count: { select: { qrCodes: true } },
      },
    }),
  ]);

  return NextResponse.json({
    success: true,
    ...paginationMeta(total, page, pageSize),
    pages,
  });
}
