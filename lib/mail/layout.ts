import { escapeHtml } from "@/lib/mail/escape";
import { mailConfig } from "@/lib/mail/config";

type LayoutOptions = {
  title: string;
  preheader?: string;
  bodyHtml: string;
  cta?: { label: string; href: string } | null;
  footerNote?: string;
};

export function renderMailLayout(options: LayoutOptions): string {
  const { brandName, appUrl, supportEmail } = mailConfig();
  const preheader = options.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(options.preheader)}</div>`
    : "";
  const cta = options.cta
    ? `<p style="margin:0 0 24px;text-align:center;">
        <a href="${escapeHtml(options.cta.href)}" style="display:inline-block;background:#0046a1;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:10px;">${escapeHtml(options.cta.label)}</a>
      </p>`
    : "";
  const footerNote = options.footerNote
    ? `<p style="margin:16px 0 0;font-size:12px;line-height:1.6;color:#94a3b8;">${options.footerNote}</p>`
    : "";

  return `
    <div style="font-family:Inter,Arial,sans-serif;background:#f8fafc;padding:32px 16px;">
      ${preheader}
      <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:32px;">
        <p style="margin:0 0 8px;font-size:18px;font-weight:700;color:#0046a1;">${escapeHtml(brandName)}</p>
        <h1 style="margin:0 0 16px;font-size:22px;color:#001B50;">${escapeHtml(options.title)}</h1>
        ${options.bodyHtml}
        ${cta}
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
        <p style="margin:0;font-size:12px;line-height:1.6;color:#94a3b8;">
          ${escapeHtml(brandName)} · <a href="${escapeHtml(appUrl)}" style="color:#64748b;text-decoration:underline;">${escapeHtml(appUrl.replace(/^https?:\/\//, ""))}</a>
          <br />Questions? Write to <a href="mailto:${escapeHtml(supportEmail)}" style="color:#64748b;text-decoration:underline;">${escapeHtml(supportEmail)}</a>
        </p>
        ${footerNote}
      </div>
    </div>
  `;
}