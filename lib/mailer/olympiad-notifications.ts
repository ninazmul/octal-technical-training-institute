import nodemailer from "nodemailer";
import { connectToDatabase } from "@/lib/database";
import OlympiadNotificationLog from "@/lib/database/models/olympiad-notification.model";
import { formatDhakaDateTime } from "@/lib/olympiad-lifecycle";

function escapeHtml(unsafe: string) {
  return unsafe
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizePhoneNumber(raw: string): string {
  let cleaned = raw.trim().replace(/\s+/g, "");
  if (/^0\d{9,}$/.test(cleaned)) {
    cleaned = "+880" + cleaned.slice(1);
  }
  if (!cleaned.startsWith("+")) {
    cleaned = "+" + cleaned;
  }
  return cleaned;
}

/**
 * Reusable SMS sender leveraging existing BulksmsBD integration
 */
export async function sendOlympiadSMS({
  olympiadId,
  number,
  message,
  type,
  idempotencyKey,
  recipientName,
}: {
  olympiadId: string;
  number: string;
  message: string;
  type:
    | "REGISTRATION_CONFIRMATION"
    | "REMINDER_24H"
    | "REMINDER_1H"
    | "EXAM_START"
    | "RESULTS_PUBLISHED"
    | "SCHEDULE_CHANGE"
    | "CUSTOM";
  idempotencyKey: string;
  recipientName?: string;
}): Promise<boolean> {
  try {
    await connectToDatabase();

    // Idempotency check: don't send duplicate SMS
    const existing = await OlympiadNotificationLog.findOne({ idempotencyKey });
    if (existing && existing.status === "SENT") {
      console.log(`[Olympiad SMS] Skipping duplicate notification for key: ${idempotencyKey}`);
      return true;
    }

    const apiKey = process.env.SMS_API_KEY;
    if (!apiKey) {
      console.warn("[Olympiad SMS] SMS_API_KEY is not set. Logging simulated SMS.");
      await OlympiadNotificationLog.findOneAndUpdate(
        { idempotencyKey },
        {
          olympiadId,
          recipientPhone: number,
          recipientName,
          channel: "SMS",
          type,
          message,
          status: "FAILED",
          error: "SMS_API_KEY is not configured",
          sentAt: new Date(),
        },
        { upsert: true, new: true },
      );
      return false;
    }

    const normalizedNumber = normalizePhoneNumber(number);
    const senderId = "Octal TTI";
    const smsUrl = `http://bulksmsbd.net/api/smsapi?api_key=${apiKey}&type=text&number=${encodeURIComponent(
      normalizedNumber,
    )}&senderid=${encodeURIComponent(senderId)}&message=${encodeURIComponent(
      message,
    )}`;

    const res = await fetch(smsUrl, { method: "GET" });
    const text = await res.text();
    const isSuccess = text.includes("202");

    await OlympiadNotificationLog.findOneAndUpdate(
      { idempotencyKey },
      {
        olympiadId,
        recipientPhone: normalizedNumber,
        recipientName,
        channel: "SMS",
        type,
        message,
        status: isSuccess ? "SENT" : "FAILED",
        providerResponse: text,
        sentAt: new Date(),
      },
      { upsert: true, new: true },
    );

    return isSuccess;
  } catch (err: any) {
    console.error("[Olympiad SMS Error]:", err);
    return false;
  }
}

/**
 * Reusable Email sender leveraging existing Nodemailer SMTP integration
 */
export async function sendOlympiadEmail({
  olympiadId,
  email,
  recipientName,
  subject,
  htmlContent,
  type,
  idempotencyKey,
}: {
  olympiadId: string;
  email: string;
  recipientName: string;
  subject: string;
  htmlContent: string;
  type:
    | "REGISTRATION_CONFIRMATION"
    | "REMINDER_24H"
    | "REMINDER_1H"
    | "EXAM_START"
    | "RESULTS_PUBLISHED"
    | "SCHEDULE_CHANGE"
    | "CUSTOM";
  idempotencyKey: string;
}): Promise<boolean> {
  try {
    await connectToDatabase();

    // Idempotency check: don't send duplicate Email
    const existing = await OlympiadNotificationLog.findOne({ idempotencyKey });
    if (existing && existing.status === "SENT") {
      console.log(`[Olympiad Email] Skipping duplicate email for key: ${idempotencyKey}`);
      return true;
    }

    const SMTP_HOST = process.env.SMTP_HOST;
    const SMTP_PORT = Number(process.env.SMTP_PORT);
    const SMTP_USER = process.env.SMTP_USER || process.env.EMAIL_USER;
    const SMTP_PASS = process.env.SMTP_PASS || process.env.EMAIL_PASS;

    if (!SMTP_USER || !SMTP_PASS) {
      console.warn("[Olympiad Email] SMTP not configured. Logging notification state.");
      await OlympiadNotificationLog.findOneAndUpdate(
        { idempotencyKey },
        {
          olympiadId,
          recipientEmail: email,
          recipientName,
          channel: "EMAIL",
          type,
          subject,
          message: htmlContent.slice(0, 500),
          status: "FAILED",
          error: "SMTP credentials not configured",
          sentAt: new Date(),
        },
        { upsert: true, new: true },
      );
      return false;
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
      tls: { rejectUnauthorized: false },
    });

    await transporter.sendMail({
      from: `"Octal Olympiad" <${SMTP_USER}>`,
      to: email,
      subject,
      html: htmlContent,
    });

    await OlympiadNotificationLog.findOneAndUpdate(
      { idempotencyKey },
      {
        olympiadId,
        recipientEmail: email,
        recipientName,
        channel: "EMAIL",
        type,
        subject,
        message: htmlContent.slice(0, 500),
        status: "SENT",
        sentAt: new Date(),
      },
      { upsert: true, new: true },
    );

    return true;
  } catch (err: any) {
    console.error("[Olympiad Email Error]:", err);
    return false;
  }
}

/**
 * Dispatch registration confirmation via both SMS and Email asynchronously
 */
export async function dispatchRegistrationConfirmation({
  olympiadId,
  olympiadTitle,
  registrationNumber,
  studentName,
  email,
  phone,
  examStartDate,
  durationMinutes,
  slug,
}: {
  olympiadId: string;
  olympiadTitle: string;
  registrationNumber: string;
  studentName: string;
  email: string;
  phone: string;
  examStartDate: Date | string;
  durationMinutes: number;
  slug: string;
}) {
  const formattedExamTime = formatDhakaDateTime(examStartDate);
  const examUrl = `${process.env.NEXT_PUBLIC_SERVER_URL || "https://octal.edu.bd"}/olympiads/${slug}/exam`;

  // 1. Send SMS
  const smsMessage = `Dear ${studentName}, your registration for ${olympiadTitle} is confirmed! Reg No: ${registrationNumber}. Exam: ${formattedExamTime} (${durationMinutes} mins). Exam link: ${examUrl} - Octal TTI`;
  sendOlympiadSMS({
    olympiadId,
    number: phone,
    message: smsMessage,
    type: "REGISTRATION_CONFIRMATION",
    idempotencyKey: `REG_CONF_SMS_${registrationNumber}`,
    recipientName: studentName,
  }).catch((e) => console.error(e));

  // 2. Send Email
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Olympiad Registration Confirmation</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; padding: 24px; color: #1e293b;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #0055CE, #003b8e); padding: 32px 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 700;">OCTAL LMS — Olympiad Confirmation</h1>
          <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 15px;">Your registration has been successfully confirmed!</p>
        </div>
        
        <div style="padding: 32px 24px;">
          <p style="font-size: 16px; margin: 0 0 16px 0;">Hi <strong>${escapeHtml(studentName)}</strong>,</p>
          <p style="font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
            Congratulations! You have been successfully registered for <strong>${escapeHtml(olympiadTitle)}</strong>. Please find your official participation details below:
          </p>

          <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Registration Number:</td>
                <td style="padding: 6px 0; font-weight: 700; color: #0055CE; font-size: 16px;">${escapeHtml(registrationNumber)}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Examination Date:</td>
                <td style="padding: 6px 0; font-weight: 600; font-size: 14px;">${formattedExamTime} (Dhaka Time)</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Duration:</td>
                <td style="padding: 6px 0; font-weight: 600; font-size: 14px;">${durationMinutes} Minutes</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${examUrl}" style="background: #0055CE; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 15px;">
              Access Examination Portal
            </a>
          </div>

          <h3 style="font-size: 16px; margin: 24px 0 8px 0;">Important Examination Instructions:</h3>
          <ul style="padding-left: 20px; font-size: 14px; color: #475569; line-height: 1.6;">
            <li>Log in with your registered email or registration number before the exam start time.</li>
            <li>Ensure a stable internet connection. Your answers are automatically saved as you progress.</li>
            <li>Once the timer expires, your test will be submitted automatically.</li>
          </ul>
        </div>

        <div style="background: #f8fafc; padding: 16px 24px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #94a3b8; text-align: center;">
          © ${new Date().getFullYear()} Octal Technical Training Institute. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  sendOlympiadEmail({
    olympiadId,
    email,
    recipientName: studentName,
    subject: `Registration Confirmed: ${olympiadTitle} (Reg: ${registrationNumber})`,
    htmlContent: emailHtml,
    type: "REGISTRATION_CONFIRMATION",
    idempotencyKey: `REG_CONF_EMAIL_${registrationNumber}`,
  }).catch((e) => console.error(e));
}
