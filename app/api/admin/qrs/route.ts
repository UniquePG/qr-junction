import { NextResponse } from "next/server";
import { Prisma, QRStatus, QRType } from "@prisma/client";
import { forbidden, requireAdmin } from "@/lib/adminAuth";
import { paginationMeta, parsePagination } from "@/lib/adminQuery";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return forbidden();

  const { searchParams } = new URL(request.url);
  const { page, pageSize, skip } = parsePagination(searchParams);
  const search = (searchParams.get("search") || "").trim();
  const type = searchParams.get("type") || "";
  const status = searchParams.get("status") || "";
  const owner = searchParams.get("owner") || "";

  const where: Prisma.QRCodeWhereInput = {};
  if (status && Object.values(QRStatus).includes(status as QRStatus)) {
    where.status = status as QRStatus;
  } else {
    where.status = { not: QRStatus.DELETED };
  }
  if (type && Object.values(QRType).includes(type as QRType)) {
    where.type = type as QRType;
  }
  if (owner) {
    const ownerId = Number(owner);
    if (ownerId) where.userId = ownerId;
  }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { shortCode: { contains: search, mode: "insensitive" } },
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
        type: true,
        status: true,
        shortCode: true,
        totalScans: true,
        uniqueScans: true,
        createdAt: true,
        user: { select: { id: true, email: true, name: true } },
      },
    }),
  ]);

  return NextResponse.json({
    success: true,
    ...paginationMeta(total, page, pageSize),
    qrs,
  });
}
