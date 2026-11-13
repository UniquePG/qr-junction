import { escapeHtml, greeting, greetingHtml } from "@/lib/mail/escape";
import { mailConfig } from "@/lib/mail/config";
import { renderMailLayout } from "@/lib/mail/layout";
import type { MailTemplate, SubscriptionMailInput } from "@/lib/mail/types";

const STATUS_LABELS: Record<string, string> = {
  TRIALING: "Trialing",
  ACTIVE: "Active",
  PAST_DUE: "Past due",
  CANCELED: "Canceled",
};

const INTERVAL_LABELS: Record<string, string> = {
  MONTH: "Monthly",
  YEAR: "Yearly",
};

function formatDate(value?: Date | string | null): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function buildSubscriptionTemplate(input: SubscriptionMailInput): MailTemplate {
  const { appUrl, brandName } = mailConfig();
  const billingUrl = `${appUrl}/dashboard/billing`;
  const statusLabel = STATUS_LABELS[input.status] || input.status;
  const intervalLabel = input.interval ? INTERVAL_LABELS[input.interval] || input.interval : null;
  const periodEnd = formatDate(input.currentPeriodEnd);

  const subject = `Your ${brandName} plan is now ${input.planName}`;
  const detailLines = [
    `Plan: ${input.planName}`,
    `Status: ${statusLabel}`,
    intervalLabel ? `Billing: ${intervalLabel}` : null,
    periodEnd ? `Current period ends: ${periodEnd}` : null,
    input.graceDays != null ? `Grace days: ${input.graceDays}` : null,
  ].filter(Boolean) as string[];

  const text = `${greeting(input.name)} your ${brandName} subscription was updated by our team.

${detailLines.join("\n")}

Review your plan anytime:
${billingUrl}

If something looks wrong, reply to this email and we will help.`;

  const rows = detailLines
    .map((line) => {
      const [label, ...rest] = line.split(": ");
      return `<tr>
        <td style="padding:8px 0;font-size:14px;color:#64748b;width:42%;">${escapeHtml(label)}</td>
        <td style="padding:8px 0;font-size:14px;font-weight:600;color:#001B50;">${escapeHtml(rest.join(": "))}</td>
      </tr>`;
    })
    .join("");

  const bodyHtml = `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">${greetingHtml(input.name)} your QR Junction subscription was updated by our team.</p>
    <table style="width:100%;border-collapse:collapse;margin:0 0 20px;">${rows}</table>
    <p style="margin:0;font-size:13px;line-height:1.6;color:#64748b;">You can review limits and billing details in your dashboard. If something looks wrong, reply to this email.</p>
  `;

  return {
    subject,
    text,
    html: renderMailLayout({
      title: "Subscription updated",
      preheader: `Your plan is now ${input.planName}`,
      bodyHtml,
      cta: { label: "View billing", href: billingUrl },
    }),
  };
}