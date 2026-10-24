import { DeviceType, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { forbidden, requireAdmin } from "@/lib/adminAuth";
import { paginationMeta, parsePagination } from "@/lib/adminQuery";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return forbidden();

  const { searchParams } = new URL(request.url);
  const { page, pageSize, skip } = parsePagination(searchParams);
  const country = (searchParams.get("country") || "").trim();
  const device = searchParams.get("device") || "";
  const search = (searchParams.get("search") || "").trim();

  const where: Prisma.ScanWhereInput = {};
  if (country) where.country = { contains: country, mode: "insensitive" };
  if (device && Object.values(DeviceType).includes(device as DeviceType)) {
    where.deviceType = device as DeviceType;
  }
  if (search) {
    where.OR = [
      { city: { contains: search, mode: "insensitive" } },
      { country: { contains: search, mode: "insensitive" } },
      { qrCode: { name: { contains: search, mode: "insensitive" } } },
      { qrCode: { shortCode: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [total, scans] = await Promise.all([
    prisma.scan.count({ where }),
    prisma.scan.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { scannedAt: "desc" },
      select: {
        id: true,
        scannedAt: true,
        country: true,
        city: true,
        state: true,
        deviceType: true,
        browser: true,
        os: true,
        utmSource: true,
        qrCode: {
          select: {
            id: true,
            name: true,
            shortCode: true,
            type: true,
            user: { select: { id: true, email: true } },
          },
        },
      },
    }),
  ]);

  return NextResponse.json({
    success: true,
    ...paginationMeta(total, page, pageSize),
    scans,
  });
}
