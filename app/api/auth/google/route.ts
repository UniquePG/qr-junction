import { NextResponse } from "next/server";
import { ensureAccountSubscription } from "@/lib/billing/seed";
import { INVALID_CREDENTIALS, userIsAdmin } from "@/lib/auth/credentials";
import { clientIp, rateLimit, rateLimitResponse } from "@/lib/auth/rateLimit";
import { adminAuth } from "@/lib/firebaseAdmin";
import { publicUser } from "@/lib/otp";
import { setEmailVerified } from "@/lib/otpDb";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const ip = clientIp(request);
    const limited = rateLimit(`google:${ip}`, 20, 15 * 60 * 1000);
    if (!limited.allowed) return rateLimitResponse(limited.retryAfterSec);

    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: INVALID_CREDENTIALS }, { status: 401 });
    }

    const token = authHeader.slice("Bearer ".length).trim();
    if (!token) {
      return NextResponse.json({ error: INVALID_CREDENTIALS }, { status: 401 });
    }

    const decoded = await adminAuth.verifyIdToken(token);
    if (!decoded?.uid || !decoded.email) {
      return NextResponse.json({ error: INVALID_CREDENTIALS }, { status: 401 });
    }

    const provider = decoded.firebase?.sign_in_provider || "";
    if (provider && provider !== "google.com") {
      return NextResponse.json({ error: INVALID_CREDENTIALS }, { status: 401 });
    }

    const email = String(decoded.email).trim().toLowerCase();
    const firebaseUid = decoded.uid;

    let user =
      (await prisma.user.findUnique({ where: { firebaseUid } })) ||
      (await prisma.user.findUnique({ where: { email } }));

    if (!user) {
      user = await prisma.user.create({
        data: {
          firebaseUid,
          email,
          name: decoded.name || email.split("@")[0] || "User",
          avatarUrl: decoded.picture || null,
          provider: "google.com",
          providerId: firebaseUid,
          role: "USER",
          emailVerified: true,
        },
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          firebaseUid: user.firebaseUid || firebaseUid,
          email,
          name: user.name || decoded.name || email.split("@")[0] || "User",
          avatarUrl: decoded.picture || user.avatarUrl,
          provider: "google.com",
          providerId: firebaseUid,
        },
      });
    }

    await ensureAccountSubscription(user.id);
    await setEmailVerified(user.id, true);

    if (userIsAdmin(user)) {
      return NextResponse.json({ error: INVALID_CREDENTIALS }, { status: 401 });
    }

    const response = NextResponse.json({
      success: true,
      user: publicUser({ ...user, emailVerified: true }),
    });
    await setSessionCookie(response, user.id);
    return response;
  } catch (error) {
    console.error("Google auth exchange failed:", error);
    return NextResponse.json({ error: INVALID_CREDENTIALS }, { status: 401 });
  }
}
