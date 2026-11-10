import nodemailer, { type Transporter } from "nodemailer";

export type EmailDeliveryResult = {
  success: boolean;
  error?: string;
};

/** Shared SMTP transport for course and Olympiad dashboard messages. */
export function createEmailTransporter(): Transporter | null {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass) return null;

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: { user, pass },
  });
}

export async function sendEmailWithTransporter({
  transporter,
  to,
  subject,
  html,
  fromName = "Octal TTI",
}: {
  transporter: Transporter;
  to: string;
  subject: string;
  html: string;
  fromName?: string;
}): Promise<EmailDeliveryResult> {
  const fromEmail = process.env.EMAIL_USER;
  if (!fromEmail) {
    return { success: false, error: "EMAIL_USER is not configured on the server." };
  }

  try {
    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error("Email delivery failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Email provider rejected the message.",
    };
  }
}
