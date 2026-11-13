import { mailConfig } from "@/lib/mail/config";
import { getMailTransporter } from "@/lib/mail/transport";
import type { MailDelivery, MailPayload } from "@/lib/mail/types";

export async function dispatchMail(
  payload: MailPayload,
  logLabel: string,
): Promise<MailDelivery> {
  const config = mailConfig();
  const transporter = getMailTransporter();

  if (!transporter) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SMTP is not configured. Set SMTP_USER and SMTP_PASS.");
    }
    console.warn(
      `[mail:${logLabel}] SMTP is not configured. Would send to ${payload.to}: ${payload.subject}\n${payload.text}`,
    );
    return { delivered: false, fallback: true };
  }

  await transporter.sendMail({
    from: config.from,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
    replyTo: payload.replyTo || config.replyTo,
  });

  return { delivered: true, fallback: false };
}

/** Fire-and-forget helper so product flows are not blocked by mail failures. */
export function queueMail(
  send: () => Promise<MailDelivery>,
  context: string,
): void {
  void send().catch((error) => {
    console.error(`[mail:${context}] failed`, error);
  });
}