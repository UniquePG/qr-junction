/**
 * Backward-compatible entry point.
 * Prefer importing from `@/lib/mail` for new code.
 */
export {
  sendOtpEmail,
  sendPasswordResetEmail,
  sendSubscriptionEmail,
  sendWelcomeEmail,
} from "@/lib/mail";
export type { MailDelivery, SubscriptionMailInput, WelcomeMailInput } from "@/lib/mail";