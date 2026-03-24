import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Registration from "@/lib/database/models/registration.model";
import { confirmRegistrationPayment } from "@/lib/actions/registration.actions";

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    // ✅ Use absolute URL with base
    const { searchParams } = new URL(
      req.url,
      process.env.NEXT_PUBLIC_SERVER_URL,
    );

    const invoice_number = searchParams.get("invoice_number");
    const status = searchParams.get("status");
    const trx_id = searchParams.get("trx_id");

    if (!invoice_number)
      return NextResponse.redirect(new URL("/registration", req.url));

    const registration = await Registration.findById(invoice_number);
    if (!registration)
      return NextResponse.redirect(new URL("/registration", req.url));

    if (status === "Successful") {
      // ✅ Confirm payment directly
      await confirmRegistrationPayment(invoice_number, {
        transactionId: trx_id || "N/A",
        paymentMethod: "PayStation",
      });
    } else {
      registration.paymentStatus = "Failed";
      await registration.save();
      console.error("Payment not successful:", invoice_number, status);
    }

    return NextResponse.redirect(new URL("/registration", req.url));
  } catch (err) {
    console.error("Payment callback error:", err);
    return NextResponse.redirect(new URL("/registration", req.url));
  }
}
