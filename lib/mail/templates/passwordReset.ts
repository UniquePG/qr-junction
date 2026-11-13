import { escapeHtml, greeting, greetingHtml } from "@/lib/mail/escape";
import { renderMailLayout } from "@/lib/mail/layout";
import type { MailTemplate } from "@/lib/mail/types";

export function buildPasswordResetTemplate(input: {
  resetUrl: string;
  name?: string | null;
}): MailTemplate {
  const { resetUrl, name } = input;
  const subject = "Reset your QR Junction password";
  const text = `${greeting(name)} we received a request to reset your QR Junction password. This link expires in 60 minutes.\n\n${resetUrl}\n\nIf you did not ask for this, you can ignore this email. Your password will stay the same.`;
  const bodyHtml = `
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#334155;">${greetingHtml(name)} we received a request to reset your QR Junction password. This link expires in 60 minutes.</p>
    <p style="margin:0 0 12px;font-size:13px;line-height:1.6;color:#64748b;word-break:break-all;">${escapeHtml(resetUrl)}</p>
    <p style="margin:0;font-size:13px;line-height:1.6;color:#64748b;">If you did not ask for this, you can ignore this email. Your password will stay the same.</p>
  `;

  return {
    subject,
    text,
    html: renderMailLayout({
      title: "Reset your password",
      preheader: "Choose a new password for your QR Junction account",
      bodyHtml,
      cta: { label: "Choose a new password", href: resetUrl },
    }),
  };
}