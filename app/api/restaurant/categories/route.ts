import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireEnabled, requireWritable } from '@/lib/billing/guard';
import { syncCategoryTranslations } from '@/lib/menu/i18n/sync';
import { restaurantAuth, restaurantErrorResponse } from '@/lib/restaurant/http';
import { auditFromContext, clientIp } from '@/lib/restaurant/audit';

export async function POST(request: Request) {
  try {
    const auth = await restaurantAuth(request, 'menu.create');
    if (auth.error) return auth.error;
    const { ctx } = auth;
    const restaurantId = ctx.restaurant.id;

    const body = await request.json();
    const { name, order, menuId } = body;

    await requireWritable(ctx.ownerUserId);

    if (!name || !menuId) {
      return NextResponse.json({ error: 'Category name and Menu ID are required' }, { status: 400 });
    }

    const menu = await prisma.menu.findFirst({
      where: {
        id: Number(menuId),
        restaurantId,
      },
    });

    if (!menu) {
      return NextResponse.json({ error: 'Menu not found or access denied' }, { status: 400 });
    }

    const maxOrderCategory = await prisma.menuCategory.findFirst({
      where: { restaurantId, menuId: Number(menuId) },
      orderBy: { order: 'desc' },
    });
    const nextOrder = maxOrderCategory ? maxOrderCategory.order + 1 : 0;

    const category = await prisma.menuCategory.create({
      data: {
        restaurantId,
        menuId: Number(menuId),
        name,
        order: order !== undefined ? Number(order) : nextOrder,
      },
    });

    void syncCategoryTranslations(restaurantId, category.id).catch((error) => {
      console.error('Category translation sync failed:', error);
    });

    const { invalidateRestaurant } = await import("@/lib/cache/invalidate");
    await invalidateRestaurant(restaurantId, { menu: Number(menuId), menusIndex: true });
    auditFromContext(ctx, {
      action: 'category.create',
      resourceType: 'menu_category',
      resourceId: category.id,
      summary: `Added category “${category.name}” to menu “${menu.name}”`,
      meta: { name: category.name, menuId: menu.id },
      ip: clientIp(request),
    });
    return NextResponse.json({ success: true, category });
  } catch (error: unknown) {
    return restaurantErrorResponse(error, 'Internal Server Error');
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await restaurantAuth(request, 'menu.update');
    if (auth.error) return auth.error;
    const { ctx } = auth;
    const restaurantId = ctx.restaurant.id;

    await requireEnabled(ctx.ownerUserId, 'restaurant.menu.edit');

    const body = await request.json();

    if (body.categories && Array.isArray(body.categories)) {
      const updates = body.categories.map((cat: { id: number; order: number }) =>
        prisma.menuCategory.updateMany({
          where: {
            id: cat.id,
            restaurantId,
          },
          data: {
            order: cat.order,
          },
        })
      );
      await prisma.$transaction(updates);
      const { invalidateRestaurant } = await import("@/lib/cache/invalidate");
      await invalidateRestaurant(restaurantId, { menu: "all", menusIndex: true });
      return NextResponse.json({ success: true, message: 'Categories reordered successfully' });
    }

    const { id, name, order } = body;
    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    const existing = await prisma.menuCategory.findFirst({
      where: { id: Number(id), restaurantId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Category not found or access denied' }, { status: 404 });
    }

    const category = await prisma.menuCategory.update({
      where: { id: Number(id) },
      data: {
        name: name !== undefined ? name : undefined,
        order: order !== undefined ? Number(order) : undefined,
      },
    });

    if (name !== undefined && name !== existing.name) {
      void syncCategoryTranslations(restaurantId, category.id).catch((error) => {
        console.error('Category translation sync failed:', error);
      });
    }

    const { invalidateRestaurant } = await import("@/lib/cache/invalidate");
    await invalidateRestaurant(restaurantId, { menu: existing.menuId, menusIndex: true });
    auditFromContext(ctx, {
      action: 'category.update',
      resourceType: 'menu_category',
      resourceId: category.id,
      summary:
        name !== undefined && name !== existing.name
          ? `Renamed category “${existing.name}” → “${category.name}”`
          : `Updated category “${category.name}”`,
      meta: { name: category.name },
      ip: clientIp(request),
    });
    return NextResponse.json({ success: true, category });
  } catch (error: unknown) {
    return restaurantErrorResponse(error, 'Internal Server Error');
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await restaurantAuth(request, 'menu.delete');
    if (auth.error) return auth.error;
    const { ctx } = auth;
    const restaurantId = ctx.restaurant.id;

    await requireEnabled(ctx.ownerUserId, 'restaurant.menu.edit');

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    const existing = await prisma.menuCategory.findFirst({
      where: { id: Number(id), restaurantId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Category not found or access denied' }, { status: 404 });
    }

    await prisma.menuCategory.delete({
      where: { id: Number(id) },
    });

    const { invalidateRestaurant } = await import("@/lib/cache/invalidate");
    await invalidateRestaurant(restaurantId, { menu: existing.menuId, menusIndex: true });
    auditFromContext(ctx, {
      action: 'category.delete',
      resourceType: 'menu_category',
      resourceId: existing.id,
      summary: `Deleted category “${existing.name}”`,
      meta: { name: existing.name },
      ip: clientIp(request),
    });
    return NextResponse.json({ success: true, message: 'Category deleted' });
  } catch (error: unknown) {
    return restaurantErrorResponse(error, 'Internal Server Error');
  }
}
