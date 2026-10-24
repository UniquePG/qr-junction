import crypto from "crypto";

export const OTP_LENGTH = 6;
export const OTP_TTL_MS = 10 * 60 * 1000;
export const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;

export function generateOtpCode(): string {
  return String(crypto.randomInt(100000, 1000000));
}

export function hashOtp(code: string, userId: number, email: string): string {
  return crypto
    .createHash("sha256")
    .update(`${code}:${userId}:${email.toLowerCase()}`)
    .digest("hex");
}

export function otpHashesMatch(storedHash: string, incomingHash: string): boolean {
  try {
    const stored = Buffer.from(storedHash, "hex");
    const incoming = Buffer.from(incomingHash, "hex");
    if (stored.length !== incoming.length) return false;
    return crypto.timingSafeEqual(stored, incoming);
  } catch {
    return false;
  }
}

export function normalizeOtpInput(code: unknown): string | null {
  if (typeof code !== "string") return null;
  const digits = code.replace(/\D/g, "");
  if (digits.length !== OTP_LENGTH) return null;
  return digits;
}

export function isOAuthProvider(provider?: string | null): boolean {
  if (!provider) return false;
  return provider === "google.com" || provider === "apple.com";
}

export function publicUser(user: {
  id: number;
  email: string;
  name: string | null;
  emailVerified: boolean;
  provider: string | null;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    emailVerified: user.emailVerified,
    provider: user.provider,
  };
}
