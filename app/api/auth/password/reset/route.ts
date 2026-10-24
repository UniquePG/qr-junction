import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";
import {
  RESET_MIN_PASSWORD_LENGTH,
  hashPasswordForDb,
  hashResetToken,
  normalizeResetToken,
} from "@/lib/passwordReset";
import { findResetByHash, markResetUsedAndUpdatePassword } from "@/lib/passwordResetDb";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const token = normalizeResetToken(body?.token);
    const password = typeof body?.password === "string" ? body.password : "";
    const confirmPassword = typeof body?.confirmPassword === "string" ? body.confirmPassword : "";

    if (!token) {
      return NextResponse.json({ error: "This reset link is invalid." }, { status: 400 });
    }

    if (password.length < RESET_MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `Password must be at least ${RESET_MIN_PASSWORD_LENGTH} characters long.` },
        { status: 400 },
      );
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

    try {
      await adminAuth.updateUser(record.firebaseUid, { password });
    } catch (firebaseError: any) {
      if (firebaseError?.code === "auth/user-not-found" && record.email) {
        const firebaseUser = await adminAuth.getUserByEmail(record.email);
        await adminAuth.updateUser(firebaseUser.uid, { password });
      } else {
        throw firebaseError;
      }
    }

    await markResetUsedAndUpdatePassword({
      tokenId: record.id,
      userId: record.userId,
      passwordHash: hashPasswordForDb(password),
    });

    return NextResponse.json({
      success: true,
      message: "Your password has been updated. You can sign in now.",
    });
  } catch (error: unknown) {
    console.error("Error resetting password:", error);
    const message =
      error instanceof Error ? error.message : "Failed to reset password.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
