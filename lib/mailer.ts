import nodemailer from "nodemailer";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildOtpEmailHtml(code: string, name?: string | null) {
  const greeting = name ? `Hi ${escapeHtml(name.split(" ")[0])},` : "Hi,";
  return `
    <div style="font-family:Inter,Arial,sans-serif;background:#f8fafc;padding:32px 16px;">
      <div style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:32px;">
        <p style="margin:0 0 8px;font-size:18px;font-weight:700;color:#0046a1;">QR Junction</p>
        <h1 style="margin:0 0 16px;font-size:22px;color:#001B50;">Verify your email</h1>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#334155;">${greeting} use this code to finish creating your account. It expires in 10 minutes.</p>
        <p style="margin:0 0 24px;letter-spacing:8px;font-size:32px;font-weight:700;color:#0046a1;text-align:center;">${escapeHtml(code)}</p>
        <p style="margin:0;font-size:13px;line-height:1.6;color:#64748b;">If you did not sign up for QR Junction, you can ignore this email.</p>
      </div>
    </div>
  `;
}

export async function sendOtpEmail(options: {
  to: string;
  code: string;
  name?: string | null;
}): Promise<{ delivered: boolean; fallback: boolean }> {
  const { to, code, name } = options;
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from =
    process.env.SMTP_FROM ||
    (user ? `QR Junction <${user}>` : "QR Junction <noreply@qrjunction.in>");

  if (!user || !pass) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SMTP is not configured. Set SMTP_USER and SMTP_PASS.");
    }
    console.warn(`[OTP] SMTP is not configured. Verification code for ${to}: ${code}`);
    return { delivered: false, fallback: true };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from,
    to,
    subject: `${code} is your QR Junction verification code`,
    text: `${name ? `Hi ${name.split(" ")[0]},\n\n` : ""}Your QR Junction verification code is ${code}. It expires in 10 minutes.\n\nIf you did not sign up, ignore this email.`,
    html: buildOtpEmailHtml(code, name),
  });

  return { delivered: true, fallback: false };
}
