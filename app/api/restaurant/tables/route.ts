import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireQuota, requireWritable } from '@/lib/billing/guard';
import { generateUniqueShortCode } from '@/utils/shortCode';
import { restaurantAuth, restaurantErrorResponse } from '@/lib/restaurant/http';
import { auditFromContext, clientIp } from '@/lib/restaurant/audit';
import { QRType, QRStatus } from '@prisma/client';

/** Keep list payloads small — frame/logo preset only, no heavy design blobs. */
function slimCustomDesign(design: unknown) {
  if (!design || typeof design !== "object" || Array.isArray(design)) return null;
  const row = design as Record<string, unknown>;
  return {
    logoPreset: typeof row.logoPreset === "string" ? row.logoPreset : "none",
    frameId: typeof row.frameId === "string" ? row.frameId : "no_frame",
    frameText: typeof row.frameText === "string" ? row.frameText : "",
    frameColor: typeof row.frameColor === "string" ? row.frameColor : "#001b50",
    frameTextColor: typeof row.frameTextColor === "string" ? row.frameTextColor : "#ffffff",
  };
}

export async function GET(request: Request) {
  try {
    const auth = await restaurantAuth(request, 'tables.view');
    if (auth.error) return auth.error;
    const { ctx } = auth;
    const restaurantId = ctx.restaurant.id;

    const { cacheGetJson, cacheSetJson } = await import("@/lib/cache/redis");
    const { restaurantCacheKey, TTL } = await import("@/lib/cache/keys");
    const cacheKey = restaurantCacheKey(restaurantId, "tables");
    const cached = await cacheGetJson<{ success: true; tables: unknown[] }>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const tables = await prisma.restaurantTable.findMany({
      where: { restaurantId },
      select: {
        id: true,
        restaurantId: true,
        menuId: true,
        tableNumber: true,
        capacity: true,
        qrCodeId: true,
        createdAt: true,
        updatedAt: true,
        menu: { select: { id: true, name: true } },
        qrCode: {
          select: {
            id: true,
            shortCode: true,
            name: true,
            fgColor: true,
            bgColor: true,
            logoUrl: true,
            customDesign: true,
            totalScans: true,
            uniqueScans: true,
          },
        },
      },
      orderBy: { tableNumber: "asc" },
    });

    const slimTables = tables.map((table) =>
      table.qrCode
        ? {
            ...table,
            qrCode: {
              ...table.qrCode,
              customDesign: slimCustomDesign(table.qrCode.customDesign),
            },
          }
        : table,
    );

    const payload = { success: true as const, tables: slimTables };
    await cacheSetJson(cacheKey, payload, TTL.tables);
    return NextResponse.json(payload);
  } catch (error: unknown) {
    return restaurantErrorResponse(error, 'Internal Server Error');
  }
}

export async function POST(request: Request) {
  try {
    const auth = await restaurantAuth(request, 'tables.manage');
    if (auth.error) return auth.error;
    const { ctx } = auth;
    const restaurant = { id: ctx.restaurant.id, name: ctx.restaurant.name };
    const ownerUserId = ctx.ownerUserId;

    const body = await request.json();
    const { tableNumber, menuId, capacity } = body;

    const tableCount = await prisma.restaurantTable.count({ where: { restaurantId: restaurant.id } });
    await requireWritable(ownerUserId);
    await requireQuota(ownerUserId, 'restaurant.tables', tableCount);

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
        userId: ownerUserId,
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

    const { invalidateRestaurant } = await import("@/lib/cache/invalidate");
    await invalidateRestaurant(restaurant.id, { tables: true });
    auditFromContext(ctx, {
      action: 'table.create',
      resourceType: 'table',
      resourceId: table.id,
      summary: `Added table “${table.tableNumber}”`,
      meta: { tableNumber: table.tableNumber, capacity: table.capacity, menuId: table.menuId },
      ip: clientIp(request),
    });
    return NextResponse.json({ success: true, table });
  } catch (error: unknown) {
    return restaurantErrorResponse(error, 'Internal Server Error');
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await restaurantAuth(request, 'tables.manage');
    if (auth.error) return auth.error;
    const { ctx } = auth;
    const restaurant = { id: ctx.restaurant.id, name: ctx.restaurant.name };

    await requireWritable(ctx.ownerUserId);

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

    const { invalidateRestaurant } = await import("@/lib/cache/invalidate");
    await invalidateRestaurant(restaurant.id, { tables: true });
    auditFromContext(ctx, {
      action: 'table.update',
      resourceType: 'table',
      resourceId: table.id,
      summary:
        existingTable.tableNumber !== table.tableNumber
          ? `Updated table “${existingTable.tableNumber}” → “${table.tableNumber}”`
          : `Updated table “${table.tableNumber}”`,
      meta: {
        before: { tableNumber: existingTable.tableNumber, capacity: existingTable.capacity, menuId: existingTable.menuId },
        after: { tableNumber: table.tableNumber, capacity: table.capacity, menuId: table.menuId },
      },
      ip: clientIp(request),
    });
    return NextResponse.json({ success: true, table });
  } catch (error: unknown) {
    return restaurantErrorResponse(error, 'Internal Server Error');
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await restaurantAuth(request, 'tables.manage');
    if (auth.error) return auth.error;
    const { ctx } = auth;
    const restaurantId = ctx.restaurant.id;

    await requireWritable(ctx.ownerUserId);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Table ID is required' }, { status: 400 });
    }

    const table = await prisma.restaurantTable.findFirst({
      where: {
        id: Number(id),
        restaurantId,
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

    const { invalidateRestaurant } = await import("@/lib/cache/invalidate");
    await invalidateRestaurant(table.restaurantId, { tables: true });
    auditFromContext(ctx, {
      action: 'table.delete',
      resourceType: 'table',
      resourceId: table.id,
      summary: `Deleted table “${table.tableNumber}”`,
      meta: { tableNumber: table.tableNumber },
      ip: clientIp(request),
    });
    return NextResponse.json({ success: true, message: 'Table and its QR code deleted' });
  } catch (error: unknown) {
    return restaurantErrorResponse(error, 'Internal Server Error');
  }
}
