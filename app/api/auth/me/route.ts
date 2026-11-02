import { NextResponse } from "next/server";
import { getSessionDbUser } from "@/lib/authHelper";
import { publicUser } from "@/lib/otp";

export async function GET(request: Request) {
  try {
    const user = await getSessionDbUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({
      user: publicUser(user),
    });
  } catch (error) {
    console.error("auth/me failed:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
