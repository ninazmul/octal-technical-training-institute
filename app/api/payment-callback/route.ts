// /app/api/payment-callback/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Registration from "@/lib/database/models/registration.model";
// import { confirmRegistrationPayment } from "@/lib/actions/registration.actions";

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const url = new URL(req.url);
    const invoice_number = url.searchParams.get("invoice_number");
    const status = url.searchParams.get("status");
    // const trx_id = url.searchParams.get("trx_id");

    if (!invoice_number) {
      return NextResponse.redirect("/registration");
    }

    const registration = await Registration.findById(invoice_number);
    if (!registration) {
      return NextResponse.redirect("/registration");
    }

    if (status === "Successful") {
      // Call your verify-payment API internally to confirm everything
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

    // ✅ Redirect user safely after handling
    return NextResponse.redirect("/registration");
  } catch (err) {
    console.error(err);
    return NextResponse.redirect("/registration");
  }
}
