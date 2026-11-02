import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/adminAuth";
import { hashPassword, verifyPassword } from "@/lib/password";

export const INVALID_CREDENTIALS = "Invalid email or password";

export type CredentialUser = {
  id: number;
  email: string;
  name: string | null;
  role: string;
  passwordHash: string | null;
  firebaseUid: string | null;
  emailVerified: boolean;
  provider: string | null;
};

export async function findUserByEmail(email: string): Promise<CredentialUser | null> {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      passwordHash: true,
      firebaseUid: true,
      emailVerified: true,
      provider: true,
    },
  });
}

export function userIsAdmin(user: Pick<CredentialUser, "role" | "email">): boolean {
  return isAdminRole(user.role, user.email);
}

/** One-time Firebase email/password bridge when DB hash is missing. */
async function bridgeFirebasePassword(
  email: string,
  password: string,
  firebaseUid: string | null,
): Promise<boolean> {
  if (!firebaseUid) return false;
  try {
    // Firebase Admin cannot verify a password directly; use REST signInWithPassword
    // when API key is available, otherwise reject (user must reset).
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) return false;

    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: false,
        }),
      },
    );
    if (!res.ok) return false;
    const data = (await res.json().catch(() => null)) as { localId?: string } | null;
    if (!data?.localId) return false;
    return data.localId === firebaseUid;
  } catch {
    return false;
  }
}

export type AuthAudience = "public" | "admin";

/**
 * Verifies email/password for the given audience.
 * Returns null on any failure (generic invalid credentials).
 * Never reveals whether the account is admin on the public path.
 */
export async function authenticateEmailPassword(
  email: string,
  password: string,
  audience: AuthAudience,
): Promise<CredentialUser | null> {
  const user = await findUserByEmail(email);
  if (!user) return null;

  const admin = userIsAdmin(user);

  if (audience === "public" && admin) {
    return null;
  }
  if (audience === "admin" && !admin) {
    return null;
  }

  if (user.passwordHash) {
    const result = await verifyPassword(password, user.passwordHash);
    if (!result.ok) return null;
    if (result.needsRehash) {
      const nextHash = await hashPassword(password);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: nextHash },
      });
      user.passwordHash = nextHash;
    }
    return user;
  }

  // Legacy bridge: no DB hash yet
  const bridged = await bridgeFirebasePassword(email, password, user.firebaseUid);
  if (!bridged) return null;

  const nextHash = await hashPassword(password);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: nextHash, provider: user.provider || "password" },
  });
  user.passwordHash = nextHash;
  return user;
}
