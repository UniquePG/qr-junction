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
  const restaurantId = Number(id);
  if (!restaurantId) {
    return NextResponse.json({ error: "Invalid restaurant id." }, { status: 400 });
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    include: {
      user: { select: { id: true, email: true, name: true } },
      menus: {
        include: {
          categories: {
            orderBy: { order: "asc" },
            include: {
              items: { orderBy: { order: "asc" } },
            },
          },
          _count: { select: { tables: true } },
        },
      },
      tables: {
        include: {
          qrCode: {
            select: { id: true, shortCode: true, totalScans: true, uniqueScans: true, status: true },
          },
          menu: { select: { id: true, name: true } },
        },
      },
      qrCodes: {
        where: { status: { not: "DELETED" } },
        select: {
          id: true,
          name: true,
          type: true,
          shortCode: true,
          totalScans: true,
          uniqueScans: true,
          status: true,
        },
      },
    },
  });

  if (!restaurant) {
    return NextResponse.json({ error: "Restaurant not found." }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    restaurant: {
      ...restaurant,
      scans: restaurant.qrCodes.reduce((sum, qr) => sum + qr.totalScans, 0),
      itemCount: restaurant.menus.reduce(
        (sum, menu) => sum + menu.categories.reduce((inner, cat) => inner + cat.items.length, 0),
        0,
      ),
    },
  });
}
