import { NextResponse } from "next/server";
import {
  INVALID_CREDENTIALS,
  authenticateEmailPassword,
} from "@/lib/auth/credentials";
import { clientIp, rateLimit, rateLimitResponse } from "@/lib/auth/rateLimit";
import { normalizeEmail } from "@/lib/auth/validation";
import { publicUser } from "@/lib/otp";
import { prisma } from "@/lib/prisma";
import { getEmailVerified } from "@/lib/otpDb";
import { auditForUser } from "@/lib/restaurant/audit";
import { setSessionCookie } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const ip = clientIp(request);
    const limited = rateLimit(`login:${ip}`, 20, 15 * 60 * 1000);
    if (!limited.allowed) return rateLimitResponse(limited.retryAfterSec);

    const body = await request.json().catch(() => ({}));
    const email = normalizeEmail(body?.email);
    const password = typeof body?.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json({ error: INVALID_CREDENTIALS }, { status: 401 });
    }

    const emailLimited = rateLimit(`login-email:${email}`, 10, 15 * 60 * 1000);
    if (!emailLimited.allowed) return rateLimitResponse(emailLimited.retryAfterSec);

    const user = await authenticateEmailPassword(email, password, "public");
    if (!user) {
      return NextResponse.json({ error: INVALID_CREDENTIALS }, { status: 401 });
    }

    if (user.provider === "staff") {
      const active = await prisma.restaurantStaff.count({ where: { userId: user.id, status: "ACTIVE" } });
      if (active === 0) {
        return NextResponse.json(
          { error: "Your access has been turned off. Please contact your restaurant owner." },
          { status: 403 },
        );
      }
    }

    const emailVerified = await getEmailVerified(user.id);
    const response = NextResponse.json({
      success: true,
      user: publicUser({ ...user, emailVerified }),
    });
    await setSessionCookie(response, user.id);
    try {
      await auditForUser(user.id, {
        action: "auth.login",
        resourceType: "session",
        resourceId: user.id,
        summary: "Signed in",
        ip,
      });
    } catch (auditError) {
      // Auditing must never block sign-in.
      console.warn("[audit] login", auditError);
    }
    return response;
  } catch (error) {
    console.error("Login failed:", error);
    return NextResponse.json(
      { error: "Sign-in is temporarily unavailable. Please try again." },
      { status: 500 },
    );
  }
}
