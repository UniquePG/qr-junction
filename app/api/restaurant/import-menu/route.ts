import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserIdFromRequest } from '@/lib/authHelper';

export async function POST(request: Request) {
  try {
    const userId = await getDbUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { userId },
    });

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant profile not found' }, { status: 400 });
    }

    const body = await request.json();
    const { categories, mode, menuId } = body; // mode: 'append' | 'overwrite'

    if (!menuId) {
      return NextResponse.json({ error: 'Menu ID is required' }, { status: 400 });
    }

    // Verify menu belongs to restaurant
    const menu = await prisma.menu.findFirst({
      where: {
        id: Number(menuId),
        restaurantId: restaurant.id,
      },
    });

    if (!menu) {
      return NextResponse.json({ error: 'Menu not found or access denied' }, { status: 400 });
    }

    if (!categories || !Array.isArray(categories)) {
      return NextResponse.json({ error: 'Invalid menu data format' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      if (mode === 'overwrite') {
        await tx.menuCategory.deleteMany({
          where: { restaurantId: restaurant.id, menuId: Number(menuId) },
        });
      }

      let currentOrder = 0;
      if (mode !== 'overwrite') {
        const lastCat = await tx.menuCategory.findFirst({
          where: { restaurantId: restaurant.id, menuId: Number(menuId) },
          orderBy: { order: 'desc' },
        });
        currentOrder = lastCat ? lastCat.order + 1 : 0;
      }

      for (let i = 0; i < categories.length; i++) {
        const cat = categories[i];
        if (!cat.name) continue;

        const dbCategory = await tx.menuCategory.create({
          data: {
            restaurantId: restaurant.id,
            menuId: Number(menuId),
            name: cat.name,
            order: currentOrder + i,
          },
        });

        if (cat.items && Array.isArray(cat.items)) {
          const itemsData = cat.items
            .filter((item: any) => item && item.name)
            .map((item: any, itemIdx: number) => {
              // Normalize variants: array with entries → store, else null
              const variants = Array.isArray(item.variants) && item.variants.length > 0
                ? item.variants
                : null;

              // If variants exist, use the minimum variant price as the base price
              let basePrice = item.price !== undefined ? Number(item.price) : 0.00;
              if (variants) {
                const minVariantPrice = Math.min(...variants.map((v: any) => Number(v.price) || 0));
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

    return NextResponse.json({ success: true, message: 'Menu imported successfully' });
  } catch (error: any) {
    console.error('Error importing menu:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
