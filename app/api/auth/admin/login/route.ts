import { NextResponse } from "next/server";
import {
  INVALID_CREDENTIALS,
  authenticateEmailPassword,
} from "@/lib/auth/credentials";
import { clientIp, rateLimit, rateLimitResponse } from "@/lib/auth/rateLimit";
import { normalizeEmail } from "@/lib/auth/validation";
import { publicUser } from "@/lib/otp";
import { getEmailVerified } from "@/lib/otpDb";
import { setSessionCookie } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const ip = clientIp(request);
    const limited = rateLimit(`admin-login:${ip}`, 15, 15 * 60 * 1000);
    if (!limited.allowed) return rateLimitResponse(limited.retryAfterSec);

    const body = await request.json().catch(() => ({}));
    const email = normalizeEmail(body?.email);
    const password = typeof body?.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json({ error: INVALID_CREDENTIALS }, { status: 401 });
    }

    const emailLimited = rateLimit(`admin-login-email:${email}`, 8, 15 * 60 * 1000);
    if (!emailLimited.allowed) return rateLimitResponse(emailLimited.retryAfterSec);

    const user = await authenticateEmailPassword(email, password, "admin");
    if (!user) {
      return NextResponse.json({ error: INVALID_CREDENTIALS }, { status: 401 });
    }

    const emailVerified = await getEmailVerified(user.id);
    const response = NextResponse.json({
      success: true,
      user: publicUser({ ...user, emailVerified }),
    });
    await setSessionCookie(response, user.id);
    return response;
  } catch (error) {
    console.error("Admin login failed:", error);
    return NextResponse.json({ error: INVALID_CREDENTIALS }, { status: 401 });
  }
}
