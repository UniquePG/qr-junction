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

  const where: Prisma.RestaurantWhereInput = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { user: { email: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [total, restaurants] = await Promise.all([
    prisma.restaurant.count({ where }),
    prisma.restaurant.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, email: true, name: true } },
        _count: { select: { menus: true, categories: true, tables: true, qrCodes: true } },
      },
    }),
  ]);

  const restaurantIds = restaurants.map((item) => item.id);
  const [scanAgg, itemCounts] = restaurantIds.length
    ? await Promise.all([
        prisma.qRCode.groupBy({
          by: ["restaurantId"],
          where: { restaurantId: { in: restaurantIds }, status: { not: "DELETED" } },
          _sum: { totalScans: true },
        }),
        prisma.menuItem.groupBy({
          by: ["categoryId"],
          _count: { id: true },
          where: { category: { restaurantId: { in: restaurantIds } } },
        }),
      ])
    : [[], []];

  const itemsByRestaurant = new Map<number, number>();
  if (itemCounts.length) {
    const categories = await prisma.menuCategory.findMany({
      where: { id: { in: itemCounts.map((row) => row.categoryId) } },
      select: { id: true, restaurantId: true },
    });
    const categoryToRestaurant = new Map(categories.map((cat) => [cat.id, cat.restaurantId]));
    itemCounts.forEach((row) => {
      const restaurantId = categoryToRestaurant.get(row.categoryId);
      if (!restaurantId) return;
      itemsByRestaurant.set(
        restaurantId,
        (itemsByRestaurant.get(restaurantId) || 0) + row._count.id,
      );
    });
  }

  const scansByRestaurant = new Map(
    scanAgg.map((row) => [row.restaurantId, row._sum.totalScans || 0]),
  );

  return NextResponse.json({
    success: true,
    ...paginationMeta(total, page, pageSize),
    restaurants: restaurants.map((item) => ({
      id: item.id,
      name: item.name,
      currency: item.currency,
      createdAt: item.createdAt,
      owner: item.user,
      menus: item._count.menus,
      categories: item._count.categories,
      items: itemsByRestaurant.get(item.id) || 0,
      tables: item._count.tables,
      qrCodes: item._count.qrCodes,
      scans: scansByRestaurant.get(item.id) || 0,
    })),
  });
}
