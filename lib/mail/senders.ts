import { dispatchMail } from "@/lib/mail/dispatch";
import { buildOtpTemplate } from "@/lib/mail/templates/otp";
import { buildPasswordResetTemplate } from "@/lib/mail/templates/passwordReset";
import { buildSubscriptionTemplate } from "@/lib/mail/templates/subscription";
import { buildWelcomeTemplate } from "@/lib/mail/templates/welcome";
import type {
  MailDelivery,
  SubscriptionMailInput,
  WelcomeMailInput,
} from "@/lib/mail/types";

export async function sendOtpEmail(options: {
  to: string;
  code: string;
  name?: string | null;
}): Promise<MailDelivery> {
  const template = buildOtpTemplate(options);
  return dispatchMail({ to: options.to, ...template }, "otp");
}

export async function sendPasswordResetEmail(options: {
  to: string;
  resetUrl: string;
  name?: string | null;
}): Promise<MailDelivery> {
  const template = buildPasswordResetTemplate(options);
  return dispatchMail({ to: options.to, ...template }, "password-reset");
}

export async function sendWelcomeEmail(options: WelcomeMailInput): Promise<MailDelivery> {
  const template = buildWelcomeTemplate(options);
  return dispatchMail({ to: options.to, ...template }, "welcome");
}

export async function sendSubscriptionEmail(
  options: SubscriptionMailInput,
): Promise<MailDelivery> {
  const template = buildSubscriptionTemplate(options);
  return dispatchMail({ to: options.to, ...template }, "subscription");
}