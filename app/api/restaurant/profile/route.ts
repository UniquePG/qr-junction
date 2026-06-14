import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserIdFromRequest } from '@/lib/authHelper';

export async function GET(request: Request) {
  try {
    const userId = await getDbUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { userId },
    });

    return NextResponse.json({ success: true, restaurant });
  } catch (error: any) {
    console.error('Error fetching restaurant profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getDbUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, logoUrl, coverImage, currency, taxRate, taxName } = body;

    if (!name) {
      return NextResponse.json({ error: 'Restaurant name is required' }, { status: 400 });
    }

    const restaurant = await prisma.restaurant.upsert({
      where: { userId },
      update: {
        name,
        description,
        logoUrl,
        coverImage,
        currency: currency || 'INR',
        taxRate: taxRate !== undefined ? Number(taxRate) : undefined,
        taxName: taxName || 'GST',
      },
      create: {
        userId,
        name,
        description,
        logoUrl,
        coverImage,
        currency: currency || 'INR',
        taxRate: taxRate !== undefined ? Number(taxRate) : 0.00,
        taxName: taxName || 'GST',
      },
    });

    // Auto-create a default Menu if no menus exist
    const menuCount = await prisma.menu.count({
      where: { restaurantId: restaurant.id }
    });

    if (menuCount === 0) {
      await prisma.menu.create({
        data: {
          restaurantId: restaurant.id,
          name: 'Main Menu',
          description: 'Our primary dining menu',
          theme: 'modern',
          isDefault: true,
        }
      });
    }

    return NextResponse.json({ success: true, restaurant });
  } catch (error: any) {
    console.error('Error updating restaurant profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
