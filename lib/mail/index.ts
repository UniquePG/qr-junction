export { mailConfig } from "@/lib/mail/config";
export { queueMail } from "@/lib/mail/dispatch";
export {
  sendOtpEmail,
  sendPasswordResetEmail,
  sendSubscriptionEmail,
  sendWelcomeEmail,
} from "@/lib/mail/senders";
export type {
  MailDelivery,
  SubscriptionMailInput,
  WelcomeMailInput,
} from "@/lib/mail/types";