import { escapeHtml, greeting, greetingHtml } from "@/lib/mail/escape";
import { renderMailLayout } from "@/lib/mail/layout";
import type { MailTemplate } from "@/lib/mail/types";

export function buildOtpTemplate(input: {
  code: string;
  name?: string | null;
}): MailTemplate {
  const { code, name } = input;
  const subject = `${code} is your QR Junction verification code`;
  const text = `${greeting(name)} use this code to finish creating your account. It expires in 10 minutes.\n\n${code}\n\nIf you did not sign up for QR Junction, you can ignore this email.`;
  const bodyHtml = `
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#334155;">${greetingHtml(name)} use this code to finish creating your account. It expires in 10 minutes.</p>
    <p style="margin:0 0 24px;letter-spacing:8px;font-size:32px;font-weight:700;color:#0046a1;text-align:center;">${escapeHtml(code)}</p>
    <p style="margin:0;font-size:13px;line-height:1.6;color:#64748b;">If you did not sign up for QR Junction, you can ignore this email.</p>
  `;

  return {
    subject,
    text,
    html: renderMailLayout({
      title: "Verify your email",
      preheader: `Your verification code is ${code}`,
      bodyHtml,
    }),
  };
}