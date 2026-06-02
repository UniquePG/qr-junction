import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify token using Firebase Admin
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    if (!decodedToken || !decodedToken.uid) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const { uid, email, name, picture } = decodedToken;

    if (!email) {
      return NextResponse.json({ error: 'Bad Request: Email is required' }, { status: 400 });
    }

    // Try parsing additional info from the body
    let password = null;
    let provider = decodedToken.firebase?.sign_in_provider || 'password';
    let providerId = decodedToken.uid || null;

    try {
      const contentType = request.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const body = await request.json().catch(() => ({}));
        if (body?.password) password = body.password;
        if (body?.provider) provider = body.provider;
      }
    } catch (e) {
      // Ignore body parsing errors
    }

    let passwordHash = null;
    if (password) {
      passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    }

    // Sync user into PostgreSQL database
    const user = await prisma.user.upsert({
      where: { firebaseUid: uid },
      update: {
        email,
        name: name || email.split('@')[0] || 'User',
        avatarUrl: picture || null,
        provider,
        providerId,
        ...(passwordHash ? { passwordHash } : {}),
      },
      create: {
        firebaseUid: uid,
        email,
        name: name || email.split('@')[0] || 'User',
        avatarUrl: picture || null,
        provider,
        providerId,
        passwordHash,
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error('Error syncing user:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
