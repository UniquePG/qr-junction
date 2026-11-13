export type MailAddress = string;

export type MailPayload = {
  to: MailAddress;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
};

export type MailDelivery = {
  delivered: boolean;
  /** True when SMTP is missing in non-production and content was logged instead. */
  fallback: boolean;
};

export type MailTemplate = {
  subject: string;
  text: string;
  html: string;
};

export type WelcomeMailInput = {
  to: string;
  name?: string | null;
};

export type SubscriptionMailInput = {
  to: string;
  name?: string | null;
  planName: string;
  status: string;
  interval?: string | null;
  currentPeriodEnd?: Date | string | null;
  graceDays?: number | null;
};