import { getAppBaseUrl } from "@/lib/passwordReset";

export function mailConfig() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER || "";
  const pass = process.env.SMTP_PASS || "";
  const from =
    process.env.SMTP_FROM ||
    (user ? `QR Junction <${user}>` : "QR Junction <noreply@qrjunction.in>");
  const replyTo = process.env.SMTP_REPLY_TO || undefined;
  const brandName = "QR Junction";
  const appUrl = getAppBaseUrl();
  const supportEmail = process.env.SUPPORT_EMAIL || "support@qrjunction.in";
  const configured = Boolean(user && pass);

  return {
    host,
    port,
    secure: port === 465,
    user,
    pass,
    from,
    replyTo,
    brandName,
    appUrl,
    supportEmail,
    configured,
  };
}