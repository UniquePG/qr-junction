import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { requireEnabled, requireQuota, requireWritable } from '@/lib/billing/guard';
import { itemsOnMenu } from '@/lib/billing/resolve';
import { isPopularFromTags, normalizeTags, parseItemConfig, withTags } from '@/lib/menu/item-config';
import { syncItemTranslations } from '@/lib/menu/i18n/sync';
import { restaurantAuth, restaurantErrorResponse } from '@/lib/restaurant/http';
import { auditFromContext, clientIp } from '@/lib/restaurant/audit';

function configFromBody(body: { tags?: unknown; config?: unknown }, existing?: unknown) {
  if (body.tags !== undefined) {
    const next = withTags(existing ?? body.config, normalizeTags(body.tags));
    return next ? (next as Prisma.InputJsonValue) : Prisma.DbNull;
  }
  if (body.config !== undefined) {
    const next = parseItemConfig(body.config);
    return next ? (next as Prisma.InputJsonValue) : Prisma.DbNull;
  }
  return undefined;
}

function popularFromBody(body: { tags?: unknown; config?: unknown; isPopular?: unknown }, fallback?: boolean) {
  if (body.tags !== undefined) return isPopularFromTags(normalizeTags(body.tags));
  if (body.config !== undefined) return isPopularFromTags(parseItemConfig(body.config)?.tags ?? []);
  if (body.isPopular !== undefined) return Boolean(body.isPopular);
  return fallback;
}

async function checkCategoryInRestaurant(categoryId: number, restaurantId: number) {
  const category = await prisma.menuCategory.findFirst({
    where: {
      id: categoryId,
      restaurantId,
    }
  });
  return !!category;
}

export async function POST(request: Request) {
  try {
    const auth = await restaurantAuth(request, 'menu.create');
    if (auth.error) return auth.error;
    const { ctx } = auth;
    const restaurantId = ctx.restaurant.id;
    const ownerUserId = ctx.ownerUserId;

    const body = await request.json();
    const {
      categoryId,
      name,
      description,
      price,
      variants,
      image,
      isAvailable,
      isVeg,
      isNonVeg,
      isVegan,
      isPopular,
      tags,
      config,
    } = body;

    if (!categoryId || !name || price === undefined) {
      return NextResponse.json({ error: 'Category ID, name, and price are required' }, { status: 400 });
    }

    const category = await prisma.menuCategory.findFirst({
      where: { id: Number(categoryId), restaurantId },
      select: { menuId: true, restaurantId: true },
    });
    if (!category) {
      return NextResponse.json({ error: 'Category not found or access denied' }, { status: 403 });
    }
    await requireWritable(ownerUserId);
    await requireQuota(ownerUserId, 'restaurant.menu.items_per_menu', await itemsOnMenu(category.menuId));

    const maxOrderItem = await prisma.menuItem.findFirst({
      where: { categoryId: Number(categoryId) },
      orderBy: { order: 'desc' },
    });
    const nextOrder = maxOrderItem ? maxOrderItem.order + 1 : 0;

    const normalizedVariants = Array.isArray(variants) && variants.length > 0 ? variants : Prisma.JsonNull;
    const normalizedConfig = configFromBody({ tags, config });
    const popular = popularFromBody({ tags, config, isPopular }, false) ?? false;

    const item = await prisma.menuItem.create({
      data: {
        categoryId: Number(categoryId),
        name,
        description,
        price: Number(price),
        variants: normalizedVariants,
        config: normalizedConfig === undefined ? Prisma.DbNull : normalizedConfig,
        image,
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
        isVeg: isVeg !== undefined ? Boolean(isVeg) : true,
        isNonVeg: isNonVeg !== undefined ? Boolean(isNonVeg) : false,
        isVegan: isVegan !== undefined ? Boolean(isVegan) : false,
        isPopular: popular,
        order: nextOrder,
      },
    });

    void syncItemTranslations(category.restaurantId, item.id).catch((error) => {
      console.error('Item translation sync failed:', error);
    });

    const { invalidateRestaurant } = await import("@/lib/cache/invalidate");
    await invalidateRestaurant(category.restaurantId, { menu: category.menuId, menusIndex: true });
    auditFromContext(ctx, {
      action: 'item.create',
      resourceType: 'menu_item',
      resourceId: item.id,
      summary: `Added item “${item.name}” (₹${Number(item.price)})`,
      meta: { name: item.name, price: Number(item.price), categoryId: item.categoryId },
      ip: clientIp(request),
    });
    return NextResponse.json({ success: true, item });
  } catch (error: unknown) {
    return restaurantErrorResponse(error, 'Internal Server Error');
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    // Toggling sold-out on its own only needs `menu.availability` (full edits need `menu.update`).
    const keys = Object.keys(body || {});
    const availabilityToggleOnly =
      body && typeof body === 'object' && body.id && typeof body.isAvailable === 'boolean' &&
      keys.every((key) => key === 'id' || key === 'isAvailable');

    const auth = await restaurantAuth(
      request,
      availabilityToggleOnly ? ['menu.update', 'menu.availability'] : 'menu.update',
    );
    if (auth.error) return auth.error;
    const { ctx } = auth;
    const restaurantId = ctx.restaurant.id;
    const ownerUserId = ctx.ownerUserId;

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    await requireEnabled(ownerUserId, 'restaurant.menu.edit');

    if (body.items && Array.isArray(body.items)) {
      const updates = body.items.map((it: { id: number; order: number }) =>
        prisma.menuItem.updateMany({
          where: {
            id: it.id,
            category: {
              restaurantId,
            }
          },
          data: {
            order: it.order,
          },
        })
      );
      await prisma.$transaction(updates);
      const { invalidateRestaurant } = await import("@/lib/cache/invalidate");
      await invalidateRestaurant(restaurantId, { menu: "all", menusIndex: true });
      return NextResponse.json({ success: true, message: 'Items reordered successfully' });
    }

    const {
      id,
      categoryId,
      name,
      description,
      price,
      variants,
      image,
      isAvailable,
      isVeg,
      isNonVeg,
      isVegan,
      isPopular,
      tags,
      config,
      order
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    const existing = await prisma.menuItem.findFirst({
      where: { id: Number(id), category: { restaurantId } },
      select: {
        id: true,
        config: true,
        name: true,
        description: true,
        variants: true,
        price: true,
        isAvailable: true,
        category: { select: { restaurantId: true } },
      },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Item not found or access denied' }, { status: 403 });
    }

    if (categoryId !== undefined) {
      const hasCatAccess = await checkCategoryInRestaurant(Number(categoryId), restaurantId);
      if (!hasCatAccess) {
        return NextResponse.json({ error: 'New category not found or access denied' }, { status: 403 });
      }
    }

    let normalizedVariants: unknown[] | typeof Prisma.JsonNull | undefined = undefined;
    if (variants !== undefined) {
      normalizedVariants = Array.isArray(variants) && variants.length > 0 ? variants : Prisma.JsonNull;
    }
    const normalizedConfig = configFromBody({ tags, config }, existing.config);
    const popular = popularFromBody({ tags, config, isPopular });

    const item = await prisma.menuItem.update({
      where: { id: Number(id) },
      data: {
        categoryId: categoryId !== undefined ? Number(categoryId) : undefined,
        name: name !== undefined ? name : undefined,
        description: description !== undefined ? description : undefined,
        price: price !== undefined ? Number(price) : undefined,
        variants: normalizedVariants as Prisma.InputJsonValue | typeof Prisma.JsonNull | undefined,
        config: normalizedConfig,
        image: image !== undefined ? image : undefined,
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : undefined,
        isVeg: isVeg !== undefined ? Boolean(isVeg) : undefined,
        isNonVeg: isNonVeg !== undefined ? Boolean(isNonVeg) : undefined,
        isVegan: isVegan !== undefined ? Boolean(isVegan) : undefined,
        isPopular: popular,
        order: order !== undefined ? Number(order) : undefined,
      },
    });

    const textChanged =
      (name !== undefined && name !== existing.name) ||
      (description !== undefined && (description ?? null) !== (existing.description ?? null)) ||
      variants !== undefined;
    if (textChanged) {
      void syncItemTranslations(existing.category.restaurantId, item.id).catch((error) => {
        console.error('Item translation sync failed:', error);
      });
    }

    const { invalidateRestaurant } = await import("@/lib/cache/invalidate");
    await invalidateRestaurant(existing.category.restaurantId, { menu: "all", menusIndex: true });

    const availabilityOnly =
      isAvailable !== undefined &&
      name === undefined &&
      description === undefined &&
      price === undefined &&
      variants === undefined &&
      image === undefined &&
      categoryId === undefined &&
      tags === undefined &&
      config === undefined;
    if (availabilityOnly && Boolean(isAvailable) !== existing.isAvailable) {
      auditFromContext(ctx, {
        action: 'item.availability',
        resourceType: 'menu_item',
        resourceId: item.id,
        summary: `Marked “${item.name}” ${item.isAvailable ? 'available' : 'unavailable'}`,
        meta: { isAvailable: item.isAvailable },
        ip: clientIp(request),
      });
    } else {
      const changed: string[] = [];
      if (name !== undefined && name !== existing.name) changed.push('name');
      if (description !== undefined && (description ?? null) !== (existing.description ?? null)) changed.push('description');
      if (price !== undefined && Number(price) !== Number(existing.price)) changed.push('price');
      if (isAvailable !== undefined && Boolean(isAvailable) !== existing.isAvailable) changed.push('availability');
      if (variants !== undefined) changed.push('variants');
      if (image !== undefined) changed.push('image');
      if (categoryId !== undefined) changed.push('category');
      if (tags !== undefined || config !== undefined) changed.push('tags');
      auditFromContext(ctx, {
        action: 'item.update',
        resourceType: 'menu_item',
        resourceId: item.id,
        summary: changed.length
          ? `Updated item “${item.name}” (${changed.join(', ')})`
          : `Updated item “${item.name}”`,
        meta: { changed },
        ip: clientIp(request),
      });
    }
    return NextResponse.json({ success: true, item });
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
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    const existing = await prisma.menuItem.findFirst({
      where: { id: Number(id), category: { restaurantId } },
      select: { id: true, name: true, category: { select: { restaurantId: true, menuId: true } } },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Item not found or access denied' }, { status: 403 });
    }

    await prisma.menuItem.delete({
      where: { id: Number(id) },
    });
    auditFromContext(ctx, {
      action: 'item.delete',
      resourceType: 'menu_item',
      resourceId: existing.id,
      summary: `Deleted item “${existing.name}”`,
      meta: { name: existing.name },
      ip: clientIp(request),
    });

    const { invalidateRestaurant } = await import("@/lib/cache/invalidate");
    await invalidateRestaurant(existing.category.restaurantId, {
      menu: existing.category.menuId,
      menusIndex: true,
    });
    return NextResponse.json({ success: true, message: 'Item deleted' });
  } catch (error: unknown) {
    return restaurantErrorResponse(error, 'Internal Server Error');
  }
}
