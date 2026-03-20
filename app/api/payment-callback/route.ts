// /app/api/payment-callback/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const invoice_number = url.searchParams.get("invoice_number");

  if (invoice_number) {
    await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/paystation/verify-payment`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoice_number }),
      },
    );
  }

  return NextResponse.redirect("/registration");
}
