import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserIdFromRequest } from '@/lib/authHelper';
import { generateUniqueShortCode } from '@/utils/shortCode';
import { QRType, QRStatus } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const userId = await getDbUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { userId },
    });

    if (!restaurant) {
      return NextResponse.json({ success: true, tables: [] });
    }

    const tables = await prisma.restaurantTable.findMany({
      where: { restaurantId: restaurant.id },
      include: {
        qrCode: true,
        menu: true,
      },
      orderBy: { tableNumber: 'asc' },
    });

    return NextResponse.json({ success: true, tables });
  } catch (error: any) {
    console.error('Error fetching tables:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

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
      return NextResponse.json({ error: 'Restaurant profile not found. Please complete profile settings first.' }, { status: 400 });
    }

    const body = await request.json();
    const { tableNumber, menuId, capacity } = body;

    if (!tableNumber) {
      return NextResponse.json({ error: 'Table number/name is required' }, { status: 400 });
    }

    const existingTable = await prisma.restaurantTable.findFirst({
      where: {
        restaurantId: restaurant.id,
        tableNumber: String(tableNumber),
      },
    });

    if (existingTable) {
      return NextResponse.json({ error: 'A table with this name/number already exists' }, { status: 400 });
    }

    const menuIdParsed = menuId ? Number(menuId) : null;
    if (menuIdParsed) {
      const menu = await prisma.menu.findFirst({
        where: { id: menuIdParsed, restaurantId: restaurant.id },
      });
      if (!menu) {
        return NextResponse.json({ error: 'Selected Menu not found or access denied' }, { status: 400 });
      }
    }

    const shortCode = await generateUniqueShortCode();

    const qrCode = await prisma.qRCode.create({
      data: {
        name: `${restaurant.name} - ${tableNumber}`,
        type: QRType.RESTAURANT_MENU,
        shortCode,
        destination: {
          restaurantId: restaurant.id,
          tableNumber: String(tableNumber),
          menuId: menuIdParsed,
        },
        userId,
        restaurantId: restaurant.id,
        fgColor: '#000000',
        bgColor: '#FFFFFF',
        status: QRStatus.ACTIVE,
      },
    });

    const table = await prisma.restaurantTable.create({
      data: {
        restaurantId: restaurant.id,
        tableNumber: String(tableNumber),
        capacity: capacity !== undefined ? Number(capacity) : 4,
        menuId: menuIdParsed,
        qrCodeId: qrCode.id,
      },
      include: {
        qrCode: true,
        menu: true,
      },
    });

    return NextResponse.json({ success: true, table });
  } catch (error: any) {
    console.error('Error creating table:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await getDbUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { userId },
    });

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant profile not found.' }, { status: 400 });
    }

    const body = await request.json();
    const { id, tableNumber, menuId, capacity } = body;

    if (!id) {
      return NextResponse.json({ error: 'Table ID is required' }, { status: 400 });
    }

    const existingTable = await prisma.restaurantTable.findFirst({
      where: {
        id: Number(id),
        restaurantId: restaurant.id,
      },
      include: {
        qrCode: true,
      },
    });

    if (!existingTable) {
      return NextResponse.json({ error: 'Table not found or access denied' }, { status: 404 });
    }

    const menuIdParsed = menuId !== undefined ? (menuId ? Number(menuId) : null) : undefined;
    if (menuIdParsed) {
      const menu = await prisma.menu.findFirst({
        where: { id: menuIdParsed, restaurantId: restaurant.id },
      });
      if (!menu) {
        return NextResponse.json({ error: 'Selected Menu not found or access denied' }, { status: 400 });
      }
    }

    const finalTableNumber = tableNumber !== undefined ? String(tableNumber) : existingTable.tableNumber;
    const finalMenuId = menuIdParsed !== undefined ? menuIdParsed : existingTable.menuId;
    const finalCapacity = capacity !== undefined ? Number(capacity) : existingTable.capacity;

    const table = await prisma.$transaction(async (tx) => {
      // 1. Update table details
      const updated = await tx.restaurantTable.update({
        where: { id: Number(id) },
        data: {
          tableNumber: finalTableNumber,
          capacity: finalCapacity,
          menuId: finalMenuId,
        },
        include: {
          qrCode: true,
          menu: true,
        },
      });

      // 2. Update linked QR Code details if it exists
      if (existingTable.qrCodeId) {
        await tx.qRCode.update({
          where: { id: existingTable.qrCodeId },
          data: {
            name: `${restaurant.name} - ${finalTableNumber}`,
            destination: {
              restaurantId: restaurant.id,
              tableNumber: finalTableNumber,
              menuId: finalMenuId,
            },
          },
        });
      }

      return updated;
    });

    return NextResponse.json({ success: true, table });
  } catch (error: any) {
    console.error('Error updating table:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await getDbUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Table ID is required' }, { status: 400 });
    }

    const table = await prisma.restaurantTable.findFirst({
      where: {
        id: Number(id),
        restaurant: { userId },
      },
    });

    if (!table) {
      return NextResponse.json({ error: 'Table not found or access denied' }, { status: 404 });
    }

    await prisma.restaurantTable.delete({
      where: { id: Number(id) },
    });

    if (table.qrCodeId) {
      await prisma.qRCode.delete({
        where: { id: table.qrCodeId },
      });
    }

    return NextResponse.json({ success: true, message: 'Table and its QR code deleted' });
  } catch (error: any) {
    console.error('Error deleting table:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
