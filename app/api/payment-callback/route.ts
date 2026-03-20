// /app/api/payment-callback/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Registration from "@/lib/database/models/registration.model";
import { confirmRegistrationPayment } from "@/lib/actions/registration.actions";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const invoice_number = url.searchParams.get("invoice_number");
  const status = url.searchParams.get("status");
  const trx_id = url.searchParams.get("trx_id");

  try {
    await connectToDatabase();

    if (invoice_number) {
      const registration = await Registration.findById(invoice_number);

      if (registration) {
        if (status === "Successful") {
          // Confirm payment and reduce seat safely
          await confirmRegistrationPayment(invoice_number, {
            transactionId: trx_id || "",
            paymentMethod: "Mobile Payment", // can adjust dynamically
          });
        } else {
          registration.paymentStatus = "Failed";
          await registration.save();
        }
      }
    }
  } catch (err) {
    console.error("Payment callback error:", err);
    // don't throw, always redirect
  }

  // Redirect to registration page (absolute URL)
  const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/registration`;
  return NextResponse.redirect(redirectUrl);
}
