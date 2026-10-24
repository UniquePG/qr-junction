import { prisma } from "@/lib/prisma";

export type PasswordResetRecord = {
  id: number;
  userId: number;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
};

function asDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

function asNullableDate(value: Date | string | null): Date | null {
  if (!value) return null;
  return asDate(value);
}

export async function findUserByEmail(email: string): Promise<{
  id: number;
  email: string;
  name: string | null;
  firebaseUid: string;
} | null> {
  const rows = await prisma.$queryRaw<
    { id: number; email: string; name: string | null; firebase_uid: string }[]
  >`
    SELECT id, email, name, firebase_uid
    FROM users
    WHERE LOWER(email) = ${email}
    LIMIT 1
  `;
  const row = rows[0];
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    firebaseUid: row.firebase_uid,
  };
}

export async function findLatestUnusedReset(userId: number): Promise<PasswordResetRecord | null> {
  const rows = await prisma.$queryRaw<
    {
      id: number;
      user_id: number;
      token_hash: string;
      expires_at: Date | string;
      used_at: Date | string | null;
      created_at: Date | string;
    }[]
  >`
    SELECT id, user_id, token_hash, expires_at, used_at, created_at
    FROM password_reset_tokens
    WHERE user_id = ${userId} AND used_at IS NULL
    ORDER BY created_at DESC
    LIMIT 1
  `;

  const row = rows[0];
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    tokenHash: row.token_hash,
    expiresAt: asDate(row.expires_at),
    usedAt: asNullableDate(row.used_at),
    createdAt: asDate(row.created_at),
  };
}

export async function deleteUnusedResets(userId: number): Promise<void> {
  await prisma.$executeRaw`
    DELETE FROM password_reset_tokens
    WHERE user_id = ${userId} AND used_at IS NULL
  `;
}

export async function createResetToken(input: {
  userId: number;
  tokenHash: string;
  expiresAt: Date;
}): Promise<void> {
  await prisma.$executeRaw`
    INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
    VALUES (${input.userId}, ${input.tokenHash}, ${input.expiresAt})
  `;
}

export async function findResetByHash(tokenHash: string): Promise<
  | (PasswordResetRecord & { firebaseUid: string; email: string })
  | null
> {
  const rows = await prisma.$queryRaw<
    {
      id: number;
      user_id: number;
      token_hash: string;
      expires_at: Date | string;
      used_at: Date | string | null;
      created_at: Date | string;
      firebase_uid: string;
      email: string;
    }[]
  >`
    SELECT t.id, t.user_id, t.token_hash, t.expires_at, t.used_at, t.created_at, u.firebase_uid, u.email
    FROM password_reset_tokens t
    JOIN users u ON u.id = t.user_id
    WHERE t.token_hash = ${tokenHash}
    LIMIT 1
  `;

  const row = rows[0];
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    tokenHash: row.token_hash,
    expiresAt: asDate(row.expires_at),
    usedAt: asNullableDate(row.used_at),
    createdAt: asDate(row.created_at),
    firebaseUid: row.firebase_uid,
    email: row.email,
  };
}

export async function markResetUsedAndUpdatePassword(input: {
  tokenId: number;
  userId: number;
  passwordHash: string;
}): Promise<void> {
  await prisma.$executeRaw`
    UPDATE users SET password_hash = ${input.passwordHash}, updated_at = NOW()
    WHERE id = ${input.userId}
  `;
  await prisma.$executeRaw`
    UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ${input.tokenId}
  `;
  await prisma.$executeRaw`
    DELETE FROM password_reset_tokens
    WHERE user_id = ${input.userId} AND used_at IS NULL AND id <> ${input.tokenId}
  `;
}
