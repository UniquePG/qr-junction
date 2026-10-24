export function needsEmailVerification(user: {
  emailVerified?: boolean;
  provider?: string | null;
} | null): boolean {
  if (!user) return false;
  if (user.emailVerified) return false;
  const provider = user.provider || "password";
  return provider !== "google.com" && provider !== "apple.com";
}

export function maskEmail(email: string | null | undefined): string {
  if (!email || !email.includes("@")) return "your email";
  const [local, domain] = email.split("@");
  const visible = local.slice(0, 1);
  return `${visible}***@${domain}`;
}
