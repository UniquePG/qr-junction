import { getEmailVerified } from "./otpDb";
import { isOAuthProvider } from "./otp";
import { prisma } from "./prisma";
import { getSessionUserId, verifySessionToken } from "./session";

type DbUser = Awaited<ReturnType<typeof prisma.user.findUnique>> & {
  emailVerified?: boolean;
};

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
    const emailVerified = await getEmailVerified(user.id);
    return { ...user, emailVerified };
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
  const user = await getDbUserFromRequest(request);
  return user?.id || null;
}

/** Kitchen live sockets pass the app session JWT as the auth token. */
export async function getDbUserIdFromIdToken(token: string): Promise<number | null> {
  const value = token.trim();
  if (!value) return null;
  try {
    const userId = await verifySessionToken(value);
    if (!userId) return null;
    const user = await loadUser(userId);
    if (!user) return null;
    const emailVerified = await getEmailVerified(user.id);
    if (!emailVerified && !isOAuthProvider(user.provider)) return null;
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
