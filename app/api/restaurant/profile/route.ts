import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getDbUserIdFromRequest } from '@/lib/authHelper';
import { requireAllowed, requireQuota, requireWritable } from '@/lib/billing/guard';
import { ensureEnglishLocale, syncRestaurantBrandTranslations } from '@/lib/menu/i18n/sync';
import {
  requireRestaurantPermission,
  resolveRestaurantContext,
} from '@/lib/restaurant/access';
import { restaurantAuth, restaurantErrorResponse } from '@/lib/restaurant/http';
import { auditFromContext, clientIp, recordRestaurantAudit } from '@/lib/restaurant/audit';
import { parseProfileBody, type ProfilePatch } from '@/lib/restaurant/profile';

function hoursValue(patch: ProfilePatch): Prisma.InputJsonValue | undefined {
  return patch.openingHours as Prisma.InputJsonValue | undefined;
}

function createData(userId: number, patch: ProfilePatch) {
  return {
    userId,
    name: patch.name,
    description: patch.description ?? null,
    logoUrl: patch.logoUrl ?? null,
    coverImage: patch.coverImage ?? null,
    currency: patch.currency ?? 'INR',
    taxRate: patch.taxRate ?? 0,
    taxName: patch.taxName ?? 'GST',
    phone: patch.phone ?? null,
    whatsapp: patch.whatsapp ?? null,
    email: patch.email ?? null,
    website: patch.website ?? null,
    instagram: patch.instagram ?? null,
    venueType: patch.venueType ?? null,
    cuisine: patch.cuisine ?? null,
    language: patch.language ?? 'en',
    addressLine1: patch.addressLine1 ?? null,
    addressLine2: patch.addressLine2 ?? null,
    city: patch.city ?? null,
    district: patch.district ?? null,
    state: patch.state ?? null,
    country: patch.country ?? null,
    pincode: patch.pincode ?? null,
    gstin: patch.gstin ?? null,
    fssai: patch.fssai ?? null,
    openingHours: hoursValue(patch),
    showOpeningHours: patch.showOpeningHours ?? false,
  };
}

export async function GET(request: Request) {
  try {
    const shellOnly = new URL(request.url).searchParams.get("fields") === "shell";
    // Sidebar chrome (name/logo) is available to any restaurant member; full profile stays gated.
    const auth = await restaurantAuth(request, shellOnly ? undefined : "profile.view");
    if (auth.error) {
      if (auth.error.status === 404) {
        return NextResponse.json({ success: true, restaurant: null });
      }
      return auth.error;
    }
    const { ctx } = auth;
    const restaurantId = ctx.restaurant.id;

    if (shellOnly) {
      const shell = await prisma.restaurant.findUnique({
        where: { id: restaurantId },
        select: { name: true, logoUrl: true, venueType: true, city: true },
      });
      return NextResponse.json({ success: true, restaurant: shell });
    }

    const { cacheGetJson, cacheSetJson } = await import("@/lib/cache/redis");
    const { restaurantCacheKey, TTL } = await import("@/lib/cache/keys");
    const cacheKey = restaurantCacheKey(restaurantId, "profile");
    const cached = await cacheGetJson<{ success: true; restaurant: unknown }>(cacheKey);
    if (cached) return NextResponse.json(cached);
    const full = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
    const payload = { success: true as const, restaurant: full };
    await cacheSetJson(cacheKey, payload, TTL.profile);
    return NextResponse.json(payload);
  } catch (error: unknown) {
    return restaurantErrorResponse(error, 'Internal Server Error');
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getDbUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const parsed = parseProfileBody(await request.json());
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const existingCtx = await resolveRestaurantContext(userId);

    // Create restaurant: only for users with no restaurant context (becoming owners).
    // Staff cannot create a restaurant.
    if (!existingCtx) {
      if (parsed.patch.language) {
        await requireAllowed(userId, 'restaurant.menu.languages', parsed.patch.language);
      } else {
        await requireWritable(userId);
      }

      const restaurant = await prisma.restaurant.create({
        data: createData(userId, parsed.patch),
      });

      await ensureEnglishLocale(restaurant.id);

      await requireQuota(userId, 'restaurant.menu.count', 0);
      await prisma.menu.create({
        data: {
          restaurantId: restaurant.id,
          name: 'Main Menu',
          description: 'Our primary dining menu',
          theme: 'modern',
          isDefault: true,
        },
      });

      void syncRestaurantBrandTranslations(restaurant.id).catch((error) => {
        console.error('Restaurant brand translation sync failed:', error);
      });

      const { invalidateRestaurant } = await import("@/lib/cache/invalidate");
      await invalidateRestaurant(restaurant.id, { profile: true, menusIndex: true, overview: true });
      recordRestaurantAudit({
        restaurantId: restaurant.id,
        actorUserId: userId,
        actorKind: 'OWNER',
        action: 'profile.create',
        resourceType: 'restaurant',
        resourceId: restaurant.id,
        summary: `Created restaurant profile “${restaurant.name}”`,
        ip: clientIp(request),
      });
      return NextResponse.json({ success: true, restaurant });
    }

    // Update existing restaurant — staff cannot create; only update with profile.update.
    requireRestaurantPermission(existingCtx, 'profile.update');
    const ownerUserId = existingCtx.ownerUserId;
    const restaurantId = existingCtx.restaurant.id;

    if (parsed.patch.language) {
      await requireAllowed(ownerUserId, 'restaurant.menu.languages', parsed.patch.language);
    } else {
      await requireWritable(ownerUserId);
    }

    const before = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { id: true, name: true, description: true },
    });

    const restaurant = await prisma.restaurant.update({
      where: { id: restaurantId },
      data: { ...parsed.patch, openingHours: hoursValue(parsed.patch) },
    });

    await ensureEnglishLocale(restaurant.id);

    const menuCount = await prisma.menu.count({
      where: { restaurantId: restaurant.id },
    });

    if (menuCount === 0) {
      await requireQuota(ownerUserId, 'restaurant.menu.count', 0);
      await prisma.menu.create({
        data: {
          restaurantId: restaurant.id,
          name: 'Main Menu',
          description: 'Our primary dining menu',
          theme: 'modern',
          isDefault: true,
        },
      });
    }

    const brandChanged =
      !before ||
      (parsed.patch.name !== undefined && parsed.patch.name !== before.name) ||
      (parsed.patch.description !== undefined &&
        (parsed.patch.description ?? null) !== (before.description ?? null));
    if (brandChanged) {
      void syncRestaurantBrandTranslations(restaurant.id).catch((error) => {
        console.error('Restaurant brand translation sync failed:', error);
      });
    }

    const { invalidateRestaurant } = await import("@/lib/cache/invalidate");
    await invalidateRestaurant(restaurant.id, { profile: true, menusIndex: true, overview: true });
    const changedFields = Object.keys(parsed.patch).filter((key) => (parsed.patch as Record<string, unknown>)[key] !== undefined);
    auditFromContext(existingCtx, {
      action: 'profile.update',
      resourceType: 'restaurant',
      resourceId: restaurant.id,
      summary: changedFields.length
        ? `Updated restaurant profile (${changedFields.slice(0, 6).join(', ')}${changedFields.length > 6 ? '…' : ''})`
        : 'Updated restaurant profile',
      meta: { fields: changedFields },
      ip: clientIp(request),
    });
    return NextResponse.json({ success: true, restaurant });
  } catch (error: unknown) {
    return restaurantErrorResponse(error, 'Internal Server Error');
  }
}
