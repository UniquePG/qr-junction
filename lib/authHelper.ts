import { isOAuthProvider } from "./otp";
import { prisma } from "./prisma";
import { getSessionUserId, verifySessionToken } from "./session";

type AuthUser = {
  id: number;
  provider: string | null;
  emailVerified: boolean;
};

type DbUser = Awaited<ReturnType<typeof prisma.user.findUnique>> & {
  emailVerified?: boolean;
};

/**
 * Accounts created by a restaurant owner for staff (provider "staff") only exist to work in
 * that restaurant. Once their access is disabled or removed they must not keep a usable session.
 */
async function staffAccessRevoked(userId: number, provider: string | null): Promise<boolean> {
  if (provider !== "staff") return false;
  const active = await prisma.restaurantStaff.count({ where: { userId, status: "ACTIVE" } });
  return active === 0;
}

async function loadAuthUser(userId: number): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, provider: true, emailVerified: true },
  });
  if (!user) return null;
  if (await staffAccessRevoked(user.id, user.provider)) return null;
  return user;
}

async function loadUser(userId: number) {
  return prisma.user.findUnique({ where: { id: userId } });
}

/** Session user without email-verification gate (OTP / me bootstrap). */
export async function getSessionDbUser(request: Request) {
  try {
    const userId = await getSessionUserId(request);
    if (!userId) return null;
    const user = await loadUser(userId);
    if (!user) return null;
    if (await staffAccessRevoked(user.id, user.provider)) return null;
    return { ...user, emailVerified: Boolean(user.emailVerified) };
  } catch (error) {
    console.error("Error getting session DB user:", error);
    return null;
  }
}

/** Authenticated app user for business APIs (requires verified email unless OAuth). */
export async function getDbUserFromRequest(request: Request) {
  const user = await getSessionDbUser(request);
  if (!user) return null;
  if (!user.emailVerified && !isOAuthProvider(user.provider)) {
    return null;
  }
  return user;
}

export async function getDbUserIdFromRequest(request: Request): Promise<number | null> {
  try {
    const userId = await getSessionUserId(request);
    if (!userId) return null;
    const user = await loadAuthUser(userId);
    if (!user) return null;
    if (!user.emailVerified && !isOAuthProvider(user.provider)) return null;
    return user.id;
  } catch (error) {
    console.error("Error getting session user id:", error);
    return null;
  }
}

/** Kitchen live sockets pass the app session JWT as the auth token. */
export async function getDbUserIdFromIdToken(token: string): Promise<number | null> {
  const value = token.trim();
  if (!value) return null;
  try {
    const userId = await verifySessionToken(value);
    if (!userId) return null;
    const user = await loadAuthUser(userId);
    if (!user) return null;
    if (!user.emailVerified && !isOAuthProvider(user.provider)) return null;
    return user.id;
  } catch {
    return null;
  }
}

/** @deprecated Firebase decoding removed; always null. */
export async function getDecodedTokenFromRequest(_request: Request) {
  return null;
}

/** @deprecated Use getDbUserIdFromRequest. */
export async function getUserIdFromRequest(_request: Request): Promise<string | null> {
  return null;
}

export type { DbUser };
