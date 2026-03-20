import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Registration from "@/lib/database/models/registration.model";

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const url = new URL(req.url);
    const invoice_number = url.searchParams.get("invoice_number");
    const status = url.searchParams.get("status");

    if (!invoice_number) {
      return NextResponse.redirect(new URL("/registration", req.url));
    }

    // ✅ Since invoice_number is MongoDB _id, use findById
    const registration = await Registration.findById(invoice_number);
    if (!registration) {
      return NextResponse.redirect(new URL("/registration", req.url));
    }

    if (status === "Successful") {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/paystation/verify-payment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invoice_number }),
        },
      );

      const data = await res.json();
      if (!data.success) {
        console.error("Verification failed", data.message);
      }
    } else {
      registration.paymentStatus = "Failed";
      await registration.save();
    }

    return NextResponse.redirect(new URL("/registration", req.url));
  } catch (err) {
    console.error("Payment callback error:", err);
    return NextResponse.redirect(new URL("/registration", req.url));
  }
}
