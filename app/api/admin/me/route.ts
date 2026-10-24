import { NextResponse } from "next/server";
import { forbidden, requireAdmin, unauthorized } from "@/lib/adminAuth";

export async function GET(request: Request) {
  const token = request.headers.get("Authorization");
  if (!token?.startsWith("Bearer ")) {
    return unauthorized();
  }

  const admin = await requireAdmin(request);
  if (!admin) return forbidden();

  return NextResponse.json({
    success: true,
    admin: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    },
  });
}
