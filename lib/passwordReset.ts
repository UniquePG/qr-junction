import crypto from "crypto";

export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;
export const RESET_RESEND_COOLDOWN_MS = 60 * 1000;
export const RESET_MIN_PASSWORD_LENGTH = 6;

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function hashResetToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function resetTokensMatch(storedHash: string, incomingHash: string): boolean {
  try {
    const stored = Buffer.from(storedHash, "hex");
    const incoming = Buffer.from(incomingHash, "hex");
    if (stored.length !== incoming.length) return false;
    return crypto.timingSafeEqual(stored, incoming);
  } catch {
    return false;
  }
}

export function normalizeEmail(email: unknown): string | null {
  if (typeof email !== "string") return null;
  const value = email.trim().toLowerCase();
  if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return null;
  return value;
}

export function normalizeResetToken(token: unknown): string | null {
  if (typeof token !== "string") return null;
  const value = token.trim();
  if (!/^[a-f0-9]{64}$/i.test(value)) return null;
  return value.toLowerCase();
}

export function getAppBaseUrl(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_CLIENT_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  return "http://localhost:3000";
}

export function hashPasswordForDb(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}
