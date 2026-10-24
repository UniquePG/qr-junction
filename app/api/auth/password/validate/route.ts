import { NextResponse } from "next/server";
import { hashResetToken, normalizeResetToken } from "@/lib/passwordReset";
import { findResetByHash } from "@/lib/passwordResetDb";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = normalizeResetToken(searchParams.get("token"));

  if (!token) {
    return NextResponse.json({ valid: false, error: "This reset link is invalid." }, { status: 400 });
  }

  const record = await findResetByHash(hashResetToken(token));
  if (!record || record.usedAt || record.expiresAt.getTime() <= Date.now()) {
    return NextResponse.json(
      { valid: false, error: "This reset link is invalid or has expired." },
      { status: 400 },
    );
  }

  return NextResponse.json({ valid: true });
}
