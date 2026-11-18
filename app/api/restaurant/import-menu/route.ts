import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireEnabled, requireQuota, requireWritable } from '@/lib/billing/guard';
import { itemsOnMenu } from '@/lib/billing/resolve';
import { retranslateActiveLocales } from '@/lib/menu/i18n/sync';
import { restaurantAuth, restaurantErrorResponse } from '@/lib/restaurant/http';
import { auditFromContext, clientIp } from '@/lib/restaurant/audit';

export async function POST(request: Request) {
  try {
    const auth = await restaurantAuth(request, ['scanner.use', 'menu.create']);
    if (auth.error) return auth.error;
    const { ctx } = auth;
    const restaurantId = ctx.restaurant.id;
    const ownerUserId = ctx.ownerUserId;

    const body = await request.json();
    const { categories, mode, menuId } = body; // mode: 'append' | 'overwrite'

    if (!menuId) {
      return NextResponse.json({ error: 'Menu ID is required' }, { status: 400 });
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

    if (!categories || !Array.isArray(categories)) {
      return NextResponse.json({ error: 'Invalid menu data format' }, { status: 400 });
    }

    const incoming = categories.reduce((sum: number, category: { items?: unknown[] }) => {
      return sum + (Array.isArray(category.items) ? category.items.length : 0);
    }, 0);
    if (mode === 'overwrite') {
      await requireEnabled(ownerUserId, 'restaurant.menu.edit');
      await requireQuota(ownerUserId, 'restaurant.menu.items_per_menu', Math.max(incoming - 1, 0));
    } else {
      await requireWritable(ownerUserId);
      const existing = await itemsOnMenu(menu.id);
      await requireQuota(ownerUserId, 'restaurant.menu.items_per_menu', existing + Math.max(incoming - 1, 0));
    }

    await prisma.$transaction(async (tx) => {
      if (mode === 'overwrite') {
        await tx.menuCategory.deleteMany({
          where: { restaurantId, menuId: Number(menuId) },
        });
      }

      let currentOrder = 0;
      if (mode !== 'overwrite') {
        const lastCat = await tx.menuCategory.findFirst({
          where: { restaurantId, menuId: Number(menuId) },
          orderBy: { order: 'desc' },
        });
        currentOrder = lastCat ? lastCat.order + 1 : 0;
      }

      for (let i = 0; i < categories.length; i++) {
        const cat = categories[i];
        if (!cat.name) continue;

        const dbCategory = await tx.menuCategory.create({
          data: {
            restaurantId,
            menuId: Number(menuId),
            name: cat.name,
            order: currentOrder + i,
          },
        });

        if (cat.items && Array.isArray(cat.items)) {
          const itemsData = cat.items
            .filter((item: { name?: string }) => item && item.name)
            .map((item: {
              name: string;
              description?: string;
              price?: number;
              variants?: { label: string; price: number }[];
              image?: string;
              isAvailable?: boolean;
              isVeg?: boolean;
              isNonVeg?: boolean;
              isVegan?: boolean;
              isPopular?: boolean;
            }, itemIdx: number) => {
              const variants = Array.isArray(item.variants) && item.variants.length > 0
                ? item.variants
                : null;

              let basePrice = item.price !== undefined ? Number(item.price) : 0.00;
              if (variants) {
                const minVariantPrice = Math.min(...variants.map((v) => Number(v.price) || 0));
                if (minVariantPrice > 0) basePrice = minVariantPrice;
              }

              return {
                categoryId: dbCategory.id,
                name: item.name,
                description: item.description || null,
                price: basePrice,
                variants,
                image: item.image || null,
                isAvailable: item.isAvailable !== undefined ? Boolean(item.isAvailable) : true,
                isVeg: item.isVeg !== undefined ? Boolean(item.isVeg) : true,
                isNonVeg: item.isNonVeg !== undefined ? Boolean(item.isNonVeg) : false,
                isVegan: item.isVegan !== undefined ? Boolean(item.isVegan) : false,
                isPopular: item.isPopular !== undefined ? Boolean(item.isPopular) : false,
                order: itemIdx,
              };
            });

          if (itemsData.length > 0) {
            await tx.menuItem.createMany({
              data: itemsData,
            });
          }
        }
      }
    });

    void retranslateActiveLocales(restaurantId).catch((error) => {
      console.error('Import menu translation sync failed:', error);
    });

    const { invalidateRestaurant } = await import("@/lib/cache/invalidate");
    await invalidateRestaurant(restaurantId, { menu: Number(menuId), menusIndex: true, overview: true });
    auditFromContext(ctx, {
      action: 'menu.import',
      resourceType: 'menu',
      resourceId: menu.id,
      summary: `Imported ${incoming} item${incoming === 1 ? '' : 's'} into menu “${menu.name}” (${mode === 'overwrite' ? 'overwrite' : 'append'})`,
      meta: { incoming, mode: mode === 'overwrite' ? 'overwrite' : 'append' },
      ip: clientIp(request),
    });
    return NextResponse.json({ success: true, message: 'Menu imported successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : undefined;
    const response = restaurantErrorResponse(error, 'Internal Server Error');
    if (response.status === 500 && message) {
      return NextResponse.json({ error: 'Internal Server Error', details: message }, { status: 500 });
    }
    return response;
  }
}
