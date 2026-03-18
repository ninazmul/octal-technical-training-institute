// app/api/paystation/initiate-payment/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Send request to PayStation API
    const res = await fetch("https://api.paystation.com.bd/initiate-payment", {
      method: "POST",
      body: new URLSearchParams(body),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "failed", message: "Payment failed" });
  }
}
