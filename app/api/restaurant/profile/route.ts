import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getDbUserIdFromRequest } from '@/lib/authHelper';
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
    const userId = await getDbUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { userId },
    });

    return NextResponse.json({ success: true, restaurant });
  } catch (error: unknown) {
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

    const parsed = parseProfileBody(await request.json());
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const restaurant = await prisma.restaurant.upsert({
      where: { userId },
      update: { ...parsed.patch, openingHours: hoursValue(parsed.patch) },
      create: createData(userId, parsed.patch),
    });

    const menuCount = await prisma.menu.count({
      where: { restaurantId: restaurant.id },
    });

    if (menuCount === 0) {
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

    return NextResponse.json({ success: true, restaurant });
  } catch (error: unknown) {
    console.error('Error updating restaurant profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
