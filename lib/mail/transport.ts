import nodemailer, { type Transporter } from "nodemailer";
import { mailConfig } from "@/lib/mail/config";

let transporter: Transporter | null = null;

export function getMailTransporter(): Transporter | null {
  const config = mailConfig();
  if (!config.configured) return null;

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: { user: config.user, pass: config.pass },
    });
  }

  return transporter;
}