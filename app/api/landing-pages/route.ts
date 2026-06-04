import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserIdFromRequest } from '@/lib/authHelper';

export async function GET(request: Request) {
  try {
    const userId = await getDbUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const landingPages = await prisma.landingPage.findMany({
      where: { userId },
      include: {
        _count: {
          select: { qrCodes: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedPages = landingPages.map((page) => ({
      id: page.id,
      slug: page.slug,
      title: page.title,
      theme: page.theme,
      profileName: page.profileName,
      bio: page.bio,
      avatarUrl: page.avatarUrl,
      socialLinks: page.socialLinks,
      buttons: page.buttons,
      createdAt: page.createdAt,
      qrCodesCount: page._count.qrCodes,
    }));

    return NextResponse.json({ success: true, landingPages: formattedPages });
  } catch (error: any) {
    console.error('Error fetching landing pages:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getDbUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      title, 
      slug, 
      theme, 
      profileName, 
      bio, 
      avatarUrl, 
      socialLinks, 
      buttons 
    } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json(
        { error: 'Bad Request: Title is required.' },
        { status: 400 }
      );
    }

    // Generate unique slug if not provided
    let finalSlug = slug ? slug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '') : '';
    if (!finalSlug) {
      finalSlug = `page-${Math.random().toString(36).substring(2, 9)}`;
    }

    // Check if slug is unique
    const existing = await prisma.landingPage.findUnique({
      where: { slug: finalSlug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Bad Request: Slug is already in use.' },
        { status: 400 }
      );
    }

    const landingPage = await prisma.landingPage.create({
      data: {
        title: title.trim(),
        slug: finalSlug,
        theme: theme || 'dark',
        profileName: profileName ? profileName.trim() : title.trim(),
        bio: bio ? bio.trim() : null,
        avatarUrl: avatarUrl || null,
        socialLinks: socialLinks || {},
        buttons: buttons || [],
        userId,
      },
    });

    return NextResponse.json({ success: true, landingPage });
  } catch (error: any) {
    console.error('Error creating landing page:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
