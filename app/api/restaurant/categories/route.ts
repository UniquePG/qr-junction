import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserIdFromRequest } from '@/lib/authHelper';

async function getRestaurantByUserId(userId: number) {
  return await prisma.restaurant.findUnique({
    where: { userId },
  });
}

export async function POST(request: Request) {
  try {
    const userId = await getDbUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const restaurant = await getRestaurantByUserId(userId);
    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant profile not set up yet' }, { status: 400 });
    }

    const body = await request.json();
    const { name, order, menuId } = body;

    if (!name || !menuId) {
      return NextResponse.json({ error: 'Category name and Menu ID are required' }, { status: 400 });
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

    const maxOrderCategory = await prisma.menuCategory.findFirst({
      where: { restaurantId: restaurant.id, menuId: Number(menuId) },
      orderBy: { order: 'desc' },
    });
    const nextOrder = maxOrderCategory ? maxOrderCategory.order + 1 : 0;

    const category = await prisma.menuCategory.create({
      data: {
        restaurantId: restaurant.id,
        menuId: Number(menuId),
        name,
        order: order !== undefined ? Number(order) : nextOrder,
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await getDbUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const restaurant = await getRestaurantByUserId(userId);
    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant profile not found' }, { status: 400 });
    }

    const body = await request.json();
    
    if (body.categories && Array.isArray(body.categories)) {
      const updates = body.categories.map((cat: { id: number; order: number }) =>
        prisma.menuCategory.updateMany({
          where: {
            id: cat.id,
            restaurantId: restaurant.id,
          },
          data: {
            order: cat.order,
          },
        })
      );
      await prisma.$transaction(updates);
      return NextResponse.json({ success: true, message: 'Categories reordered successfully' });
    }

    const { id, name, order } = body;
    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    const existing = await prisma.menuCategory.findFirst({
      where: { id: Number(id), restaurantId: restaurant.id },
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

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await getDbUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const restaurant = await getRestaurantByUserId(userId);
    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant profile not found' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    const existing = await prisma.menuCategory.findFirst({
      where: { id: Number(id), restaurantId: restaurant.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Category not found or access denied' }, { status: 404 });
    }

    await prisma.menuCategory.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true, message: 'Category deleted' });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
