import { prisma } from "@/lib/prisma";

export type OtpRecord = {
  id: number;
  userId: number;
  codeHash: string;
  expiresAt: Date;
  attempts: number;
  lastSentAt: Date;
};

function asDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

export async function getEmailVerified(userId: number): Promise<boolean> {
  const rows = await prisma.$queryRaw<{ email_verified: boolean }[]>`
    SELECT email_verified FROM users WHERE id = ${userId} LIMIT 1
  `;
  return Boolean(rows[0]?.email_verified);
}

export async function setEmailVerified(userId: number, verified: boolean): Promise<void> {
  await prisma.$executeRaw`
    UPDATE users SET email_verified = ${verified} WHERE id = ${userId}
  `;
}

export async function findOtpByUserId(userId: number): Promise<OtpRecord | null> {
  const rows = await prisma.$queryRaw<
    {
      id: number;
      user_id: number;
      code_hash: string;
      expires_at: Date | string;
      attempts: number;
      last_sent_at: Date | string;
    }[]
  >`
    SELECT id, user_id, code_hash, expires_at, attempts, last_sent_at
    FROM email_otps
    WHERE user_id = ${userId}
    LIMIT 1
  `;

  const row = rows[0];
  if (!row) return null;

  return {
    id: row.id,
    userId: row.user_id,
    codeHash: row.code_hash,
    expiresAt: asDate(row.expires_at),
    attempts: row.attempts,
    lastSentAt: asDate(row.last_sent_at),
  };
}

export async function upsertOtp(input: {
  userId: number;
  codeHash: string;
  expiresAt: Date;
  lastSentAt: Date;
}): Promise<void> {
  await prisma.$executeRaw`
    INSERT INTO email_otps (user_id, code_hash, expires_at, attempts, last_sent_at)
    VALUES (${input.userId}, ${input.codeHash}, ${input.expiresAt}, 0, ${input.lastSentAt})
    ON CONFLICT (user_id)
    DO UPDATE SET
      code_hash = EXCLUDED.code_hash,
      expires_at = EXCLUDED.expires_at,
      attempts = 0,
      last_sent_at = EXCLUDED.last_sent_at
  `;
}

export async function incrementOtpAttempts(userId: number): Promise<number> {
  const rows = await prisma.$queryRaw<{ attempts: number }[]>`
    UPDATE email_otps
    SET attempts = attempts + 1
    WHERE user_id = ${userId}
    RETURNING attempts
  `;
  return rows[0]?.attempts ?? 0;
}

export async function deleteOtp(userId: number): Promise<void> {
  await prisma.$executeRaw`DELETE FROM email_otps WHERE user_id = ${userId}`;
}
