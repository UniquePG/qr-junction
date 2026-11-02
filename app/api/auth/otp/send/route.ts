import { NextResponse } from "next/server";
import { getSessionDbUser } from "@/lib/authHelper";
import { clientIp, rateLimit, rateLimitResponse } from "@/lib/auth/rateLimit";
import { sendOtpEmail } from "@/lib/mailer";
import {
  OTP_RESEND_COOLDOWN_MS,
  OTP_TTL_MS,
  generateOtpCode,
  hashOtp,
  isOAuthProvider,
  publicUser,
} from "@/lib/otp";
import {
  findOtpByUserId,
  setEmailVerified,
  upsertOtp,
} from "@/lib/otpDb";

export async function POST(request: Request) {
  try {
    const ip = clientIp(request);
    const limited = rateLimit(`otp-send:${ip}`, 10, 15 * 60 * 1000);
    if (!limited.allowed) return rateLimitResponse(limited.retryAfterSec);

    const user = await getSessionDbUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isOAuthProvider(user.provider) && !user.emailVerified) {
      await setEmailVerified(user.id, true);
      return NextResponse.json({
        success: true,
        alreadyVerified: true,
        user: publicUser({ ...user, emailVerified: true }),
      });
    }

    if (user.emailVerified) {
      return NextResponse.json({
        success: true,
        alreadyVerified: true,
        user: publicUser(user),
      });
    }

    const existing = await findOtpByUserId(user.id);
    if (existing) {
      const elapsed = Date.now() - existing.lastSentAt.getTime();
      if (elapsed < OTP_RESEND_COOLDOWN_MS) {
        const retryAfter = Math.ceil((OTP_RESEND_COOLDOWN_MS - elapsed) / 1000);
        return NextResponse.json(
          {
            error: "Please wait before requesting another code.",
            retryAfter,
          },
          { status: 429 },
        );
      }
    }

    const code = generateOtpCode();
    const now = new Date();

    await upsertOtp({
      userId: user.id,
      codeHash: hashOtp(code, user.id, user.email),
      expiresAt: new Date(now.getTime() + OTP_TTL_MS),
      lastSentAt: now,
    });

    const result = await sendOtpEmail({
      to: user.email,
      code,
      name: user.name,
    });

    return NextResponse.json({
      success: true,
      alreadyVerified: false,
      expiresInSeconds: Math.floor(OTP_TTL_MS / 1000),
      retryAfter: Math.floor(OTP_RESEND_COOLDOWN_MS / 1000),
      delivered: result.delivered,
      previewedInServer: result.fallback,
    });
  } catch (error: unknown) {
    console.error("Error sending OTP:", error);
    const message =
      error instanceof Error ? error.message : "Failed to send verification code.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
