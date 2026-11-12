import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDbUserIdFromRequest } from "@/lib/authHelper";
import { createTimer } from "@/lib/perf/timing";

const menuTreeInclude = {
  categories: {
    orderBy: { order: "asc" as const },
    include: {
      items: {
        orderBy: { order: "asc" as const },
      },
    },
  },
};

export async function GET(request: Request) {
  const timer = createTimer();
  try {
    const userId = await getDbUserIdFromRequest(request);
    timer.mark("auth");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const menuIdParam = searchParams.get("menuId");

    const restaurant = await prisma.restaurant.findUnique({
      where: { userId },
      select: {
        id: true,
        name: true,
        description: true,
        logoUrl: true,
        coverImage: true,
        currency: true,
        taxRate: true,
        taxName: true,
        language: true,
        orderingEnabled: true,
      },
    });
    timer.mark("restaurant");

    if (!restaurant) {
      return NextResponse.json({ success: true, restaurant: null, menu: null });
    }

    const { cacheGetJson, cacheSetJson } = await import("@/lib/cache/redis");
    const { menuTreeCacheKey, TTL } = await import("@/lib/cache/keys");

    let menuId = menuIdParam ? Number(menuIdParam) : null;
    if (!menuId || !Number.isFinite(menuId)) {
      const fallback = await prisma.menu.findFirst({
        where: { restaurantId: restaurant.id },
        orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
        select: { id: true },
      });
      menuId = fallback?.id ?? null;
    }

    if (!menuId) {
      return NextResponse.json({ success: true, restaurant, menu: null });
    }

    const cacheKey = menuTreeCacheKey(restaurant.id, menuId);
    const cached = await cacheGetJson<{ success: true; restaurant: unknown; menu: unknown }>(cacheKey);
    timer.mark("cache");
    if (cached) {
      const response = NextResponse.json(cached);
      timer.apply(response);
      timer.log("GET /api/restaurant/menu hit");
      return response;
    }

    const menu = await prisma.menu.findFirst({
      where: { id: menuId, restaurantId: restaurant.id },
      include: menuTreeInclude,
    });
    timer.mark("db");

    const payload = { success: true as const, restaurant, menu };
    await cacheSetJson(cacheKey, payload, TTL.menuTree);
    const response = NextResponse.json(payload);
    timer.apply(response);
    timer.log("GET /api/restaurant/menu miss");
    return response;
  } catch (error) {
    console.error("Error fetching menu:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
