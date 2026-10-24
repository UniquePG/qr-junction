import { NextResponse } from "next/server";
import { LeadStatus, Prisma } from "@prisma/client";
import { forbidden, requireAdmin } from "@/lib/adminAuth";
import { paginationMeta, parsePagination } from "@/lib/adminQuery";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return forbidden();

  const { searchParams } = new URL(request.url);
  const { page, pageSize, skip } = parsePagination(searchParams);
  const search = (searchParams.get("search") || "").trim();
  const status = searchParams.get("status") || "";

  const where: Prisma.LeadWhereInput = {};
  if (status && Object.values(LeadStatus).includes(status as LeadStatus)) {
    where.status = status as LeadStatus;
  }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { user: { email: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [total, leads] = await Promise.all([
    prisma.lead.count({ where }),
    prisma.lead.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, email: true, name: true } },
        qrCode: { select: { id: true, name: true, shortCode: true } },
        campaign: { select: { id: true, name: true } },
      },
    }),
  ]);

  return NextResponse.json({
    success: true,
    ...paginationMeta(total, page, pageSize),
    leads,
  });
}
