import { greeting, greetingHtml } from "@/lib/mail/escape";
import { mailConfig } from "@/lib/mail/config";
import { renderMailLayout } from "@/lib/mail/layout";
import type { MailTemplate, WelcomeMailInput } from "@/lib/mail/types";

export function buildWelcomeTemplate(input: WelcomeMailInput): MailTemplate {
  const { appUrl, brandName } = mailConfig();
  const dashboardUrl = `${appUrl}/dashboard`;
  const subject = `Welcome to ${brandName}`;
  const text = `${greeting(input.name)} welcome to ${brandName}.

Your account is ready. Open your dashboard to create QR codes, landing pages, restaurant menus, and review campaigns.

${dashboardUrl}

If you have any questions, just reply to this email — we are happy to help.`;

  const bodyHtml = `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">${greetingHtml(input.name)} welcome to QR Junction.</p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">Your account is ready. From the dashboard you can create QR codes, build landing pages, publish digital menus, and run review campaigns — all in one place.</p>
    <ul style="margin:0 0 20px;padding-left:18px;font-size:15px;line-height:1.7;color:#334155;">
      <li>Create and track dynamic QR codes</li>
      <li>Design menus guests can scan at the table</li>
      <li>Collect reviews and grow your brand</li>
    </ul>
    <p style="margin:0;font-size:13px;line-height:1.6;color:#64748b;">If you did not create this account, you can ignore this email.</p>
  `;

  return {
    subject,
    text,
    html: renderMailLayout({
      title: "Welcome aboard",
      preheader: "Your QR Junction account is ready",
      bodyHtml,
      cta: { label: "Open your dashboard", href: dashboardUrl },
    }),
  };
}