import { NextResponse } from "next/server";
import { getDecodedTokenFromRequest } from "@/lib/authHelper";
import { adminAuth } from "@/lib/firebaseAdmin";
import {
  OTP_MAX_ATTEMPTS,
  hashOtp,
  normalizeOtpInput,
  otpHashesMatch,
  publicUser,
} from "@/lib/otp";
import {
  deleteOtp,
  findOtpByUserId,
  getEmailVerified,
  incrementOtpAttempts,
  setEmailVerified,
} from "@/lib/otpDb";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const decoded = await getDecodedTokenFromRequest(request);
    if (!decoded?.uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const code = normalizeOtpInput(body?.code);
    if (!code) {
      return NextResponse.json(
        { error: "Enter the 6-digit code sent to your email." },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { firebaseUid: decoded.uid },
    });

    if (!user) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    const emailVerified = await getEmailVerified(user.id);
    if (emailVerified) {
      return NextResponse.json({
        success: true,
        alreadyVerified: true,
        user: publicUser({ ...user, emailVerified: true }),
      });
    }

    const otp = await findOtpByUserId(user.id);
    if (!otp) {
      return NextResponse.json(
        { error: "No verification code found. Please request a new one." },
        { status: 400 },
      );
    }

    if (otp.expiresAt.getTime() < Date.now()) {
      return NextResponse.json(
        { error: "That code has expired. Request a new one." },
        { status: 400 },
      );
    }

    if (otp.attempts >= OTP_MAX_ATTEMPTS) {
      return NextResponse.json(
        { error: "Too many attempts. Request a new code." },
        { status: 429 },
      );
    }

    const incomingHash = hashOtp(code, user.id, user.email);
    if (!otpHashesMatch(otp.codeHash, incomingHash)) {
      const attempts = await incrementOtpAttempts(user.id);
      const remaining = OTP_MAX_ATTEMPTS - attempts;
      return NextResponse.json(
        {
          error:
            remaining > 0
              ? `Invalid code. ${remaining} attempt${remaining === 1 ? "" : "s"} left.`
              : "Too many attempts. Request a new code.",
          remainingAttempts: Math.max(remaining, 0),
        },
        { status: remaining > 0 ? 400 : 429 },
      );
    }

    await setEmailVerified(user.id, true);
    await deleteOtp(user.id);

    try {
      await adminAuth.updateUser(decoded.uid, { emailVerified: true });
    } catch (error) {
      console.error("Failed to mark Firebase email as verified:", error);
    }

    return NextResponse.json({
      success: true,
      alreadyVerified: false,
      user: publicUser({ ...user, emailVerified: true }),
    });
  } catch (error: unknown) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { error: "Failed to verify code. Please try again." },
      { status: 500 },
    );
  }
}
