import { adminAuth } from "@/lib/firebaseAdmin";
import { prisma } from "@/lib/prisma";

export type AdminUser = {
  id: number;
  email: string;
  name: string | null;
  role: string;
  firebaseUid: string;
};

export function parseAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminRole(role?: string | null, email?: string | null): boolean {
  if (role === "ADMIN" || role === "OWNER") return true;
  if (email && parseAdminEmails().includes(email.toLowerCase())) return true;
  return false;
}

async function getTokenFromRequest(request: Request): Promise<string | null> {
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length);
  }
  return null;
}

export async function requireAdmin(request: Request): Promise<AdminUser | null> {
  const token = await getTokenFromRequest(request);
  if (!token) return null;

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    if (!decoded?.uid) return null;

    const user = await prisma.user.findUnique({
      where: { firebaseUid: decoded.uid },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        firebaseUid: true,
      },
    });

    if (!user) return null;

    const allowlisted = parseAdminEmails().includes(user.email.toLowerCase());
    if (!isAdminRole(user.role, user.email)) return null;

    if (allowlisted && user.role === "USER") {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: "ADMIN" },
      });
      return { ...user, role: "ADMIN" };
    }

    return user;
  } catch (error) {
    console.error("requireAdmin failed:", error);
    return null;
  }
}

export function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

export function forbidden() {
  return Response.json({ error: "Admin access required." }, { status: 403 });
}
