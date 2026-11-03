import crypto from "crypto";
import bcrypt from "bcryptjs";

const BCRYPT_COST = 12;
const MIN_PASSWORD_LENGTH = 8;
const SHA256_HEX_RE = /^[a-f0-9]{64}$/i;

export function isPasswordPolicyOk(password: string): boolean {
  if (typeof password !== "string") return false;
  if (password.length < MIN_PASSWORD_LENGTH) return false;
  if (!password.trim()) return false;
  return true;
}

export function passwordPolicyError(password: string): string | null {
  if (typeof password !== "string" || !password.trim()) {
    return "Password is required";
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }
  return null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST);
}

function isBcryptHash(hash: string): boolean {
  return hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$");
}

function sha256Hex(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export type PasswordVerifyResult = {
  ok: boolean;
  needsRehash: boolean;
};

/** Verifies bcrypt or legacy SHA-256 hashes. Unknown formats fail closed. */
export async function verifyPassword(
  password: string,
  storedHash: string | null | undefined,
): Promise<PasswordVerifyResult> {
  if (!storedHash) return { ok: false, needsRehash: false };

  if (isBcryptHash(storedHash)) {
    const ok = await bcrypt.compare(password, storedHash);
    return { ok, needsRehash: false };
  }

  // Legacy SHA-256 from earlier admin:create / sync paths
  if (!SHA256_HEX_RE.test(storedHash)) {
    return { ok: false, needsRehash: false };
  }

  const legacy = sha256Hex(password);
  try {
    const a = Buffer.from(legacy, "hex");
    const b = Buffer.from(storedHash.toLowerCase(), "hex");
    if (a.length !== b.length) return { ok: false, needsRehash: false };
    const ok = crypto.timingSafeEqual(a, b);
    return { ok, needsRehash: ok };
  } catch {
    return { ok: false, needsRehash: false };
  }
}
