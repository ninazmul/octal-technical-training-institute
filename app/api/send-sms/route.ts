import { NextRequest } from "next/server";
import { sendBulkSmsBd } from "@/lib/mailer/bulksms";

export const POST = async (req: NextRequest) => {
  try {
    const { number, message } = await req.json();

    if (!number || !message) {
      return new Response("Number and message are required", { status: 400 });
    }

    const result = await sendBulkSmsBd({ number, message });

    if (result.ok) {
      return new Response("SMS sent successfully!", { status: 200 });
    }

    console.error("BulksmsBD rejected the message:", result.providerResponse);
    return new Response(`SMS failed: ${result.error}`, { status: 500 });
  } catch (err) {
    console.error("SMS sending error:", err);
    return new Response("Failed to send SMS", { status: 500 });
  }
};
