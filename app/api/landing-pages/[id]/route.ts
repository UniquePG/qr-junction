import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserIdFromRequest } from '@/lib/authHelper';

export async function GET(
  request: Request,
  { params }: { params: Promise<any> }
) {
  try {
    const userId = await getDbUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const pageId = parseInt(id, 10);
    if (isNaN(pageId)) {
      return NextResponse.json({ error: 'Invalid Page ID' }, { status: 400 });
    }

    const page = await prisma.landingPage.findFirst({
      where: {
        id: pageId,
        userId,
      },
      include: {
        qrCodes: true,
      },
    });

    if (!page) {
      return NextResponse.json({ error: 'Landing page not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, landingPage: page });
  } catch (error: any) {
    console.error('Error fetching landing page details:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<any> }
) {
  try {
    const userId = await getDbUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const pageId = parseInt(id, 10);
    if (isNaN(pageId)) {
      return NextResponse.json({ error: 'Invalid Page ID' }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.landingPage.findFirst({
      where: {
        id: pageId,
        userId,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Landing page not found' }, { status: 404 });
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

    if (title !== undefined && (!title || typeof title !== 'string' || !title.trim())) {
      return NextResponse.json(
        { error: 'Bad Request: Title cannot be empty.' },
        { status: 400 }
      );
    }

    let finalSlug = existing.slug;
    if (slug !== undefined) {
      const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
      if (!cleanSlug) {
        return NextResponse.json(
          { error: 'Bad Request: Invalid slug format.' },
          { status: 400 }
        );
      }

      if (cleanSlug !== existing.slug) {
        // Check uniqueness
        const uniqueCheck = await prisma.landingPage.findUnique({
          where: { slug: cleanSlug },
        });
        if (uniqueCheck) {
          return NextResponse.json(
            { error: 'Bad Request: Slug is already in use.' },
            { status: 400 }
          );
        }
        finalSlug = cleanSlug;
      }
    }

    const updated = await prisma.landingPage.update({
      where: { id: pageId },
      data: {
        title: title !== undefined ? title.trim() : undefined,
        slug: finalSlug,
        theme: theme !== undefined ? theme : undefined,
        profileName: profileName !== undefined ? (profileName ? profileName.trim() : title.trim()) : undefined,
        bio: bio !== undefined ? (bio ? bio.trim() : null) : undefined,
        avatarUrl: avatarUrl !== undefined ? avatarUrl : undefined,
        socialLinks: socialLinks !== undefined ? socialLinks : undefined,
        buttons: buttons !== undefined ? buttons : undefined,
      },
    });

    return NextResponse.json({ success: true, landingPage: updated });
  } catch (error: any) {
    console.error('Error updating landing page:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<any> }
) {
  try {
    const userId = await getDbUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const pageId = parseInt(id, 10);
    if (isNaN(pageId)) {
      return NextResponse.json({ error: 'Invalid Page ID' }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.landingPage.findFirst({
      where: {
        id: pageId,
        userId,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Landing page not found' }, { status: 404 });
    }

    // Delete Landing page (onDelete: SetNull on QRCode handles dissociation)
    await prisma.landingPage.delete({
      where: { id: pageId },
    });

    return NextResponse.json({ success: true, message: 'Landing page deleted successfully.' });
  } catch (error: any) {
    console.error('Error deleting landing page:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
