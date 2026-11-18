import { NextResponse } from "next/server";
import { getDbUserIdFromRequest } from "@/lib/authHelper";
import { auditForUser, clientIp } from "@/lib/restaurant/audit";
import { clearSessionCookie } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const userId = await getDbUserIdFromRequest(request);
    if (userId) {
      await auditForUser(userId, {
        action: "auth.logout",
        resourceType: "session",
        resourceId: userId,
        summary: "Signed out",
        ip: clientIp(request),
      });
    }
  } catch (error) {
    // Never block sign-out on audit problems.
    console.warn("[audit] logout", error);
  }
  const response = NextResponse.json({ success: true });
  clearSessionCookie(response);
  return response;
}
