import { NextRequest } from "next/server";
import { createEmailTransporter, sendEmailWithTransporter } from "@/lib/mailer/email";

export const POST = async (req: NextRequest) => {
  try {
    const { recipients } = await req.json();

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return new Response("Recipients are required", { status: 400 });
    }

    const transporter = createEmailTransporter();
    if (!transporter) {
      return new Response("EMAIL_USER and EMAIL_PASS are not configured", { status: 500 });
    }

    // 🚀 Send emails in parallel
    const results = await Promise.all(
      recipients.map((r) =>
        sendEmailWithTransporter({
          transporter,
          to: r.email,
          subject: r.subject || "Message from Octal Technical Training Institute",
          html:
            r.html ||
            `<p>Hi ${r.name || "there"},</p><p>This is a message.</p>`,
        }),
      ),
    );

    const failed = results.filter((result) => !result.success);
    if (failed.length > 0) {
      return Response.json(
        {
          success: false,
          sent: results.length - failed.length,
          failed: failed.length,
          error: failed[0].error,
        },
        { status: 502 },
      );
    }

    return Response.json({ success: true, sent: results.length, failed: 0 });
  } catch (error) {
    console.error("Send message error:", error);
    return new Response("Failed to send email", { status: 500 });
  }
};
