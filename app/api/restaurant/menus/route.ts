import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserIdFromRequest } from '@/lib/authHelper';
import { generateUniqueShortCode } from '@/utils/shortCode';
import { QRType, QRStatus } from '@prisma/client';

// Helper to verify restaurant ownership
async function getRestaurantByUserId(userId: number) {
  return await prisma.restaurant.findUnique({
    where: { userId },
  });
}

export async function GET(request: Request) {
  try {
    const userId = await getDbUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const restaurant = await getRestaurantByUserId(userId);
    if (!restaurant) {
      return NextResponse.json({ success: true, menus: [] });
    }

    const menus = await prisma.menu.findMany({
      where: { restaurantId: restaurant.id },
      orderBy: { createdAt: 'asc' },
    });

    const qrCodes = await prisma.qRCode.findMany({
      where: {
        userId,
        type: QRType.RESTAURANT_MENU,
      }
    });

    const menusWithQr = [];
    for (const menu of menus) {
      let qr = qrCodes.find(q => {
        const dest = q.destination as any;
        return dest && dest.menuId === menu.id && !dest.tableNumber;
      });

      if (!qr) {
        // Lazy create QR Code for the menu
        const shortCode = await generateUniqueShortCode();
        qr = await prisma.qRCode.create({
          data: {
            name: `${restaurant.name} - ${menu.name} Direct QR`,
            type: QRType.RESTAURANT_MENU,
            shortCode,
            destination: {
              restaurantId: restaurant.id,
              menuId: menu.id,
            },
            userId,
            restaurantId: restaurant.id,
            fgColor: '#000000',
            bgColor: '#FFFFFF',
            status: QRStatus.ACTIVE,
          }
        });
      }

      menusWithQr.push({
        ...menu,
        qrCode: {
          id: qr.id,
          shortCode: qr.shortCode,
          name: qr.name,
          fgColor: qr.fgColor,
          bgColor: qr.bgColor,
          totalScans: qr.totalScans,
          uniqueScans: qr.uniqueScans,
        }
      });
    }

    return NextResponse.json({ success: true, menus: menusWithQr });
  } catch (error: any) {
    console.error('Error fetching menus:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
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
    const { name, description, theme, isDefault } = body;

    if (!name) {
      return NextResponse.json({ error: 'Menu name is required' }, { status: 400 });
    }

    // Check if this is the first menu, if so, force it to be default
    const existingCount = await prisma.menu.count({
      where: { restaurantId: restaurant.id }
    });
    const makeDefault = existingCount === 0 || !!isDefault;

    const newMenu = await prisma.$transaction(async (tx) => {
      if (makeDefault) {
        // Unset any existing default menus
        await tx.menu.updateMany({
          where: { restaurantId: restaurant.id },
          data: { isDefault: false },
        });
      }

      return await tx.menu.create({
        data: {
          restaurantId: restaurant.id,
          name,
          description: description || null,
          theme: theme || 'modern',
          isDefault: makeDefault,
        },
      });
    });

    // Create QR Code for the menu
    const shortCode = await generateUniqueShortCode();
    const qrCode = await prisma.qRCode.create({
      data: {
        name: `${restaurant.name} - ${newMenu.name} Direct QR`,
        type: QRType.RESTAURANT_MENU,
        shortCode,
        destination: {
          restaurantId: restaurant.id,
          menuId: newMenu.id,
        },
        userId,
        restaurantId: restaurant.id,
        fgColor: '#000000',
        bgColor: '#FFFFFF',
        status: QRStatus.ACTIVE,
      }
    });

    const menuWithQr = {
      ...newMenu,
      qrCode: {
        id: qrCode.id,
        shortCode: qrCode.shortCode,
        name: qrCode.name,
        fgColor: qrCode.fgColor,
        bgColor: qrCode.bgColor,
        totalScans: qrCode.totalScans,
        uniqueScans: qrCode.uniqueScans,
      }
    };

    return NextResponse.json({ success: true, menu: menuWithQr });
  } catch (error: any) {
    console.error('Error creating menu:', error);
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
    const { id, name, description, theme, isDefault } = body;

    if (!id) {
      return NextResponse.json({ error: 'Menu ID is required' }, { status: 400 });
    }

    // Verify ownership of the menu
    const existingMenu = await prisma.menu.findFirst({
      where: {
        id: Number(id),
        restaurantId: restaurant.id,
      },
    });

    if (!existingMenu) {
      return NextResponse.json({ error: 'Menu not found or access denied' }, { status: 404 });
    }

    const updatedMenu = await prisma.$transaction(async (tx) => {
      if (isDefault && !existingMenu.isDefault) {
        // Unset any existing default menus
        await tx.menu.updateMany({
          where: { restaurantId: restaurant.id },
          data: { isDefault: false },
        });
      }

      return await tx.menu.update({
        where: { id: Number(id) },
        data: {
          name: name !== undefined ? name : undefined,
          description: description !== undefined ? description : undefined,
          theme: theme !== undefined ? theme : undefined,
          isDefault: isDefault !== undefined ? Boolean(isDefault) : undefined,
        },
      });
    });

    if (name) {
      const qrCodes = await prisma.qRCode.findMany({
        where: {
          userId,
          type: QRType.RESTAURANT_MENU,
        }
      });
      const targetQr = qrCodes.find(q => {
        const dest = q.destination as any;
        return dest && dest.menuId === Number(id) && !dest.tableNumber;
      });
      if (targetQr) {
        await prisma.qRCode.update({
          where: { id: targetQr.id },
          data: {
            name: `${restaurant.name} - ${name} Direct QR`
          }
        });
      }
    }

    // Fetch the updated menu with its QR code to return consistent model
    const qrCodes = await prisma.qRCode.findMany({
      where: {
        userId,
        type: QRType.RESTAURANT_MENU,
      }
    });
    const qr = qrCodes.find(q => {
      const dest = q.destination as any;
      return dest && dest.menuId === updatedMenu.id && !dest.tableNumber;
    });

    const menuWithQr = {
      ...updatedMenu,
      qrCode: qr ? {
        id: qr.id,
        shortCode: qr.shortCode,
        name: qr.name,
        fgColor: qr.fgColor,
        bgColor: qr.bgColor,
        totalScans: qr.totalScans,
        uniqueScans: qr.uniqueScans,
      } : null
    };

    return NextResponse.json({ success: true, menu: menuWithQr });
  } catch (error: any) {
    console.error('Error updating menu:', error);
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
      return NextResponse.json({ error: 'Menu ID is required' }, { status: 400 });
    }

    const menuIdParsed = Number(id);

    // Verify ownership
    const existingMenu = await prisma.menu.findFirst({
      where: {
        id: menuIdParsed,
        restaurantId: restaurant.id,
      },
    });

    if (!existingMenu) {
      return NextResponse.json({ error: 'Menu not found or access denied' }, { status: 404 });
    }

    // Check count: do not allow deleting the only menu
    const totalMenus = await prisma.menu.count({
      where: { restaurantId: restaurant.id }
    });

    if (totalMenus <= 1) {
      return NextResponse.json({ error: 'Cannot delete the only menu. A restaurant must have at least one menu.' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // Delete the menu
      await tx.menu.delete({
        where: { id: menuIdParsed },
      });

      // If we deleted the default menu, set another one as default
      if (existingMenu.isDefault) {
        const fallbackMenu = await tx.menu.findFirst({
          where: { restaurantId: restaurant.id },
        });
        if (fallbackMenu) {
          await tx.menu.update({
            where: { id: fallbackMenu.id },
            data: { isDefault: true },
          });
        }
      }
    });

    // Delete matching QR Code
    const qrCodes = await prisma.qRCode.findMany({
      where: {
        userId,
        type: QRType.RESTAURANT_MENU,
      }
    });
    const targetQr = qrCodes.find(q => {
      const dest = q.destination as any;
      return dest && dest.menuId === menuIdParsed && !dest.tableNumber;
    });
    if (targetQr) {
      await prisma.qRCode.delete({
        where: { id: targetQr.id },
      });
    }

    return NextResponse.json({ success: true, message: 'Menu deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting menu:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
