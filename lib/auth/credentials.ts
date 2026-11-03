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

type FirebaseBridgeResult =
  | { ok: true; uid: string }
  | { ok: false };

/**
 * Verify email/password against Firebase Identity Toolkit.
 * Accepts when:
 * - stored firebaseUid matches the signed-in localId, or
 * - stored firebaseUid is missing (legacy rows) and sign-in succeeds.
 */
async function bridgeFirebasePassword(
  email: string,
  password: string,
  firebaseUid: string | null,
): Promise<FirebaseBridgeResult> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) return { ok: false };

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
    if (!res.ok) return { ok: false };

    const data = (await res.json().catch(() => null)) as { localId?: string } | null;
    const uid = data?.localId;
    if (!uid) return { ok: false };

    if (firebaseUid && firebaseUid !== uid) return { ok: false };
    return { ok: true, uid };
  } catch {
    return { ok: false };
  }
}

async function persistUpgradedCredentials(
  user: CredentialUser,
  password: string,
  firebaseUid?: string | null,
): Promise<CredentialUser> {
  const nextHash = await hashPassword(password);
  const data: {
    passwordHash: string;
    provider?: string;
    firebaseUid?: string;
    providerId?: string;
  } = {
    passwordHash: nextHash,
  };

  if (!user.provider) {
    data.provider = "password";
  }

  if (firebaseUid && firebaseUid !== user.firebaseUid) {
    data.firebaseUid = firebaseUid;
    data.providerId = firebaseUid;
  }

  await prisma.user.update({
    where: { id: user.id },
    data,
  });

  user.passwordHash = nextHash;
  if (data.firebaseUid) user.firebaseUid = data.firebaseUid;
  if (data.provider) user.provider = data.provider;
  return user;
}

export type AuthAudience = "public" | "admin";

/**
 * Verifies email/password for the given audience.
 * Order:
 * 1. bcrypt / legacy SHA-256 in Postgres
 * 2. Firebase email/password (missing hash, or stale hash that no longer matches)
 * On Firebase success, upgrades the row to a bcrypt hash.
 * Returns null on auth failure (generic invalid credentials).
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
    if (result.ok) {
      if (result.needsRehash) {
        return persistUpgradedCredentials(user, password);
      }
      return user;
    }
    // Stale DB hash: fall through to Firebase before rejecting.
  }

  const bridged = await bridgeFirebasePassword(email, password, user.firebaseUid);
  if (!bridged.ok) return null;

  return persistUpgradedCredentials(user, password, bridged.uid);
}
