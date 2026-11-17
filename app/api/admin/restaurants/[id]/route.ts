import { NextResponse } from "next/server";
import { forbidden, requireAdmin } from "@/lib/adminAuth";
import { allows } from "@/lib/billing/guard";
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

export async function PATCH(
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

  const body = await request.json().catch(() => ({}));
  const hasOrdering = typeof body.orderingEnabled === "boolean";
  const hasCallWaiter = typeof body.callWaiterEnabled === "boolean";
  if (!hasOrdering && !hasCallWaiter) {
    return NextResponse.json(
      { error: "Provide orderingEnabled or callWaiterEnabled as a boolean." },
      { status: 400 },
    );
  }

  try {
    const current = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { userId: true },
    });
    if (!current) return NextResponse.json({ error: "Restaurant not found." }, { status: 404 });

    if (hasOrdering && body.orderingEnabled && !(await allows(current.userId, "restaurant.ordering"))) {
      return NextResponse.json(
        {
          error: "plan_limit",
          message: "This plan does not include live orders. Grant an override first.",
          feature: "restaurant.ordering",
        },
        { status: 402 },
      );
    }

    if (
      hasCallWaiter &&
      body.callWaiterEnabled &&
      !(await allows(current.userId, "restaurant.call_waiter"))
    ) {
      return NextResponse.json(
        {
          error: "plan_limit",
          message: "This plan does not include call waiter. Grant an override first.",
          feature: "restaurant.call_waiter",
        },
        { status: 402 },
      );
    }

    const restaurant = await prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        ...(hasOrdering ? { orderingEnabled: body.orderingEnabled } : {}),
        ...(hasCallWaiter ? { callWaiterEnabled: body.callWaiterEnabled } : {}),
      },
      select: {
        id: true,
        name: true,
        orderingEnabled: true,
        callWaiterEnabled: true,
      },
    });
    const { invalidateRestaurant } = await import("@/lib/cache/invalidate");
    await invalidateRestaurant(restaurant.id, {
      settings: true,
      ordersActive: true,
      overview: true,
      menu: "all",
    });
    return NextResponse.json({ success: true, restaurant });
  } catch {
    return NextResponse.json({ error: "Restaurant not found." }, { status: 404 });
  }
}
