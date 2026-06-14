import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserIdFromRequest } from '@/lib/authHelper';

export async function GET(request: Request) {
  try {
    const userId = await getDbUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const menuIdParam = searchParams.get('menuId');

    const restaurant = await prisma.restaurant.findUnique({
      where: { userId },
    });

    if (!restaurant) {
      return NextResponse.json({ success: true, restaurant: null, menu: null });
    }

    let menu = null;

    if (menuIdParam) {
      // Fetch specific menu
      menu = await prisma.menu.findFirst({
        where: {
          id: Number(menuIdParam),
          restaurantId: restaurant.id,
        },
        include: {
          categories: {
            orderBy: { order: 'asc' },
            include: {
              items: {
                orderBy: { order: 'asc' },
              },
            },
          },
        },
      });
    } else {
      // Fallback to default menu
      menu = await prisma.menu.findFirst({
        where: {
          restaurantId: restaurant.id,
          isDefault: true,
        },
        include: {
          categories: {
            orderBy: { order: 'asc' },
            include: {
              items: {
                orderBy: { order: 'asc' },
              },
            },
          },
        },
      });

      // If no default menu found, fallback to first menu
      if (!menu) {
        menu = await prisma.menu.findFirst({
          where: { restaurantId: restaurant.id },
          include: {
            categories: {
              orderBy: { order: 'asc' },
              include: {
                items: {
                  orderBy: { order: 'asc' },
                },
              },
            },
          },
        });
      }
    }

    return NextResponse.json({ success: true, restaurant, menu });
  } catch (error: any) {
    console.error('Error fetching restaurant menu:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
