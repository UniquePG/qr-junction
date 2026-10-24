import { NextResponse } from "next/server";
import { getDecodedTokenFromRequest } from "@/lib/authHelper";
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
  getEmailVerified,
  setEmailVerified,
  upsertOtp,
} from "@/lib/otpDb";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const decoded = await getDecodedTokenFromRequest(request);
    if (!decoded?.uid || !decoded.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const provider = decoded.firebase?.sign_in_provider || "password";
    const oauthVerified = isOAuthProvider(provider);

    let user = await prisma.user.findUnique({
      where: { firebaseUid: decoded.uid },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          firebaseUid: decoded.uid,
          email: decoded.email,
          name: decoded.name || decoded.email.split("@")[0] || "User",
          avatarUrl: decoded.picture || null,
          provider,
          providerId: decoded.uid,
        },
      });
    }

    let emailVerified = await getEmailVerified(user.id);
    if (oauthVerified && !emailVerified) {
      await setEmailVerified(user.id, true);
      emailVerified = true;
    }

    if (emailVerified) {
      return NextResponse.json({
        success: true,
        alreadyVerified: true,
        user: publicUser({ ...user, emailVerified: true }),
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
