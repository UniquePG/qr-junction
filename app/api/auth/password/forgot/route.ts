import { NextResponse } from "next/server";
import { sendPasswordResetEmail } from "@/lib/mailer";
import {
  RESET_RESEND_COOLDOWN_MS,
  RESET_TOKEN_TTL_MS,
  generateResetToken,
  getAppBaseUrl,
  hashResetToken,
  normalizeEmail,
} from "@/lib/passwordReset";
import {
  createResetToken,
  deleteUnusedResets,
  findLatestUnusedReset,
  findUserByEmail,
} from "@/lib/passwordResetDb";

const GENERIC_SUCCESS = {
  success: true,
  message: "If an account exists for that email, we sent a reset link.",
};

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = normalizeEmail(body?.email);

    if (!email) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json(GENERIC_SUCCESS);
    }

    const latest = await findLatestUnusedReset(user.id);
    if (latest) {
      const elapsed = Date.now() - latest.createdAt.getTime();
      if (elapsed < RESET_RESEND_COOLDOWN_MS) {
        return NextResponse.json({
          ...GENERIC_SUCCESS,
          retryAfter: Math.ceil((RESET_RESEND_COOLDOWN_MS - elapsed) / 1000),
        });
      }
    }

    await deleteUnusedResets(user.id);

    const token = generateResetToken();
    const now = new Date();

    await createResetToken({
      userId: user.id,
      tokenHash: hashResetToken(token),
      expiresAt: new Date(now.getTime() + RESET_TOKEN_TTL_MS),
    });

    const resetUrl = `${getAppBaseUrl()}/reset-password?token=${token}`;
    const result = await sendPasswordResetEmail({
      to: user.email,
      resetUrl,
      name: user.name,
    });

    return NextResponse.json({
      ...GENERIC_SUCCESS,
      expiresInSeconds: Math.floor(RESET_TOKEN_TTL_MS / 1000),
      delivered: result.delivered,
      previewedInServer: result.fallback,
    });
  } catch (error: unknown) {
    console.error("Error sending password reset:", error);
    const message =
      error instanceof Error ? error.message : "Failed to send password reset email.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
