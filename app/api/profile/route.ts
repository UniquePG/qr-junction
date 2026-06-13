import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserIdFromRequest } from '@/lib/authHelper';
import { ProfileType } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const userId = await getDbUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: { name: true, email: true, avatarUrl: true }
        }
      }
    });

    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await getDbUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      type, 
      businessName, 
      industry, 
      website, 
      phone, 
      address, 
      about, 
      logoUrl 
    } = body;

    // Validate type enum
    if (type && !Object.values(ProfileType).includes(type)) {
      return NextResponse.json({ error: 'Invalid profile type' }, { status: 400 });
    }

    // Upsert profile
    const profile = await prisma.profile.upsert({
      where: { userId },
      update: {
        type: type as ProfileType,
        businessName,
        industry,
        website,
        phone,
        address,
        about,
        logoUrl
      },
      create: {
        userId,
        type: (type as ProfileType) || ProfileType.INDIVIDUAL,
        businessName,
        industry,
        website,
        phone,
        address,
        about,
        logoUrl
      }
    });

    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
