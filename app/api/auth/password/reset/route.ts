import { NextResponse } from "next/server";
import { clientIp, rateLimit, rateLimitResponse } from "@/lib/auth/rateLimit";
import { hashPassword, passwordPolicyError } from "@/lib/password";
import {
  hashResetToken,
  normalizeResetToken,
} from "@/lib/passwordReset";
import { findResetByHash, markResetUsedAndUpdatePassword } from "@/lib/passwordResetDb";

export async function POST(request: Request) {
  try {
    const ip = clientIp(request);
    const limited = rateLimit(`password-reset:${ip}`, 10, 15 * 60 * 1000);
    if (!limited.allowed) return rateLimitResponse(limited.retryAfterSec);

    const body = await request.json().catch(() => ({}));
    const token = normalizeResetToken(body?.token);
    const password = typeof body?.password === "string" ? body.password : "";
    const confirmPassword = typeof body?.confirmPassword === "string" ? body.confirmPassword : "";

    if (!token) {
      return NextResponse.json({ error: "This reset link is invalid." }, { status: 400 });
    }

    const policyError = passwordPolicyError(password);
    if (policyError) {
      return NextResponse.json({ error: policyError }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
    }

    const record = await findResetByHash(hashResetToken(token));
    if (!record || record.usedAt || record.expiresAt.getTime() <= Date.now()) {
      return NextResponse.json(
        { error: "This reset link is invalid or has expired. Request a new one." },
        { status: 400 },
      );
    }

    const passwordHash = await hashPassword(password);
    await markResetUsedAndUpdatePassword({
      tokenId: record.id,
      userId: record.userId,
      passwordHash,
    });

    return NextResponse.json({
      success: true,
      message: "Your password has been updated. You can sign in now.",
    });
  } catch (error: unknown) {
    console.error("Error resetting password:", error);
    return NextResponse.json({ error: "Failed to reset password." }, { status: 500 });
  }
}
