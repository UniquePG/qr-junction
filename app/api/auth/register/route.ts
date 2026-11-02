import { NextResponse } from "next/server";
import { ensureAccountSubscription } from "@/lib/billing/seed";
import { findUserByEmail } from "@/lib/auth/credentials";
import { clientIp, rateLimit, rateLimitResponse } from "@/lib/auth/rateLimit";
import { normalizeEmail, requireString } from "@/lib/auth/validation";
import { hashPassword, passwordPolicyError } from "@/lib/password";
import { publicUser } from "@/lib/otp";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const ip = clientIp(request);
    const limited = rateLimit(`register:${ip}`, 10, 15 * 60 * 1000);
    if (!limited.allowed) return rateLimitResponse(limited.retryAfterSec);

    const body = await request.json().catch(() => ({}));
    const email = normalizeEmail(body?.email);
    const password = typeof body?.password === "string" ? body.password : "";
    const name = requireString(body?.name, 120) || email?.split("@")[0] || "User";

    if (!email) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    const passwordError = passwordPolicyError(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const emailLimited = rateLimit(`register-email:${email}`, 5, 60 * 60 * 1000);
    if (!emailLimited.allowed) return rateLimitResponse(emailLimited.retryAfterSec);

    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in." },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        provider: "password",
        role: "USER",
        emailVerified: false,
      },
    });

    await ensureAccountSubscription(user.id);

    const response = NextResponse.json({
      success: true,
      user: publicUser(user),
    });
    await setSessionCookie(response, user.id);
    return response;
  } catch (error) {
    console.error("Register failed:", error);
    return NextResponse.json({ error: "Registration failed." }, { status: 500 });
  }
}
