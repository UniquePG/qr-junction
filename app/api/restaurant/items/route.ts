import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserIdFromRequest } from '@/lib/authHelper';
import { Prisma } from '@prisma/client';
import { planErrorResponse } from '@/lib/billing/errors';
import { requireEnabled, requireQuota, requireWritable } from '@/lib/billing/guard';
import { itemsOnMenu } from '@/lib/billing/resolve';
import { isPopularFromTags, normalizeTags, parseItemConfig, withTags } from '@/lib/menu/item-config';

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

async function checkCategoryOwnership(categoryId: number, userId: number) {
  const category = await prisma.menuCategory.findFirst({
    where: {
      id: categoryId,
      restaurant: { userId }
    }
  });
  return !!category;
}

async function checkItemOwnership(itemId: number, userId: number) {
  const item = await prisma.menuItem.findFirst({
    where: {
      id: itemId,
      category: {
        restaurant: { userId }
      }
    }
  });
  return !!item;
}

export async function POST(request: Request) {
  try {
    const userId = await getDbUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
      where: { id: Number(categoryId), restaurant: { userId } },
      select: { menuId: true },
    });
    if (!category) {
      return NextResponse.json({ error: 'Category not found or access denied' }, { status: 403 });
    }
    await requireWritable(userId);
    await requireQuota(userId, 'restaurant.menu.items_per_menu', await itemsOnMenu(category.menuId));

    const maxOrderItem = await prisma.menuItem.findFirst({
      where: { categoryId: Number(categoryId) },
      orderBy: { order: 'desc' },
    });
    const nextOrder = maxOrderItem ? maxOrderItem.order + 1 : 0;

    // Normalize variants: array of { label: string, price: number } or null
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

    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    const denied = planErrorResponse(error);
    if (denied) return denied;
    console.error('Error creating menu item:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await getDbUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await requireEnabled(userId, 'restaurant.menu.edit');

    const body = await request.json();
    
    if (body.items && Array.isArray(body.items)) {
      const updates = body.items.map((it: { id: number; order: number }) =>
        prisma.menuItem.updateMany({
          where: {
            id: it.id,
            category: {
              restaurant: { userId }
            }
          },
          data: {
            order: it.order,
          },
        })
      );
      await prisma.$transaction(updates);
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
      where: { id: Number(id), category: { restaurant: { userId } } },
      select: { id: true, config: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Item not found or access denied' }, { status: 403 });
    }

    if (categoryId !== undefined) {
      const hasCatAccess = await checkCategoryOwnership(Number(categoryId), userId);
      if (!hasCatAccess) {
        return NextResponse.json({ error: 'New category not found or access denied' }, { status: 403 });
      }
    }

    // Normalize variants: empty array → null (clear), populated array → store, undefined → leave unchanged
    let normalizedVariants: any[] | typeof Prisma.JsonNull | undefined = undefined;
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
        variants: normalizedVariants,
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

    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    const denied = planErrorResponse(error);
    if (denied) return denied;
    console.error('Error updating menu item:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await getDbUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await requireEnabled(userId, 'restaurant.menu.edit');

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    const hasAccess = await checkItemOwnership(Number(id), userId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Item not found or access denied' }, { status: 403 });
    }

    await prisma.menuItem.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true, message: 'Item deleted' });
  } catch (error: any) {
    const denied = planErrorResponse(error);
    if (denied) return denied;
    console.error('Error deleting menu item:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
