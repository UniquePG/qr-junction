import { NextResponse } from "next/server";
import { confirmUserPassword } from "@/lib/auth/credentials";
import { clientIp, rateLimit, rateLimitResponse } from "@/lib/auth/rateLimit";
import { getSessionDbUser } from "@/lib/authHelper";
import { adminAuth } from "@/lib/firebaseAdmin";
import { hashPassword, passwordPolicyError } from "@/lib/password";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const user = await getSessionDbUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = clientIp(request);
    const limited = rateLimit(`password-change:${user.id}:${ip}`, 8, 15 * 60 * 1000);
    if (!limited.allowed) return rateLimitResponse(limited.retryAfterSec);

    const body = await request.json().catch(() => ({}));
    const currentPassword = typeof body?.currentPassword === "string" ? body.currentPassword : "";
    const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";
    const confirmPassword = typeof body?.confirmPassword === "string" ? body.confirmPassword : "";

    if (!currentPassword) {
      return NextResponse.json({ error: "Current password is required." }, { status: 400 });
    }

    const policyError = passwordPolicyError(newPassword);
    if (policyError) {
      return NextResponse.json({ error: policyError }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: "New passwords do not match." }, { status: 400 });
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: "New password must be different from your current password." },
        { status: 400 },
      );
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        {
          error:
            "This account has no password set (for example Google sign-in only). Use Forgot password on the login page to create one.",
        },
        { status: 400 },
      );
    }

    const confirmed = await confirmUserPassword(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        passwordHash: user.passwordHash,
        firebaseUid: user.firebaseUid,
        emailVerified: user.emailVerified,
        provider: user.provider,
      },
      currentPassword,
    );

    if (!confirmed) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
    }

    const passwordHash = await hashPassword(newPassword);
    const firebaseUid = confirmed.firebaseUid;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        provider: confirmed.provider || "password",
      },
    });

    if (firebaseUid) {
      try {
        await adminAuth.updateUser(firebaseUid, { password: newPassword });
      } catch (error) {
        console.warn("Firebase password sync failed after local change:", error);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json({ error: "Could not change password." }, { status: 500 });
  }
}
