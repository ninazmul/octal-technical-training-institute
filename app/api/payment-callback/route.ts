import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Registration from "@/lib/database/models/registration.model";
import { confirmRegistrationPayment } from "@/lib/actions/registration.actions";

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const url = new URL(req.url);
    const invoice_number = url.searchParams.get("invoice_number");
    const status = url.searchParams.get("status");
    const trx_id = url.searchParams.get("trx_id");

    if (!invoice_number)
      return NextResponse.redirect(new URL("/registration", req.url));

    const registration = await Registration.findById(invoice_number);
    if (!registration)
      return NextResponse.redirect(new URL("/registration", req.url));

    if (status === "Successful") {
      // 🔒 Verify payment with PayStation
      const res = await fetch(
        "https://api.paystation.com.bd/transaction-status",
        {
          method: "POST",
          headers: {
            merchantId: process.env.NEXT_PUBLIC_PAYSTATION_MERCHANT_ID!,
          },
          body: new URLSearchParams({ invoice_number }),
        },
      );

      const data = await res.json();

      if (data.status_code === "200") {
        const trx = data.data;
        const trxStatus = (trx.trx_status || "").toLowerCase();

        if (trxStatus === "success") {
          // ✅ Confirm payment and reduce seats
          await confirmRegistrationPayment(invoice_number, {
            transactionId: trx_id || trx.trx_id,
            paymentMethod: trx.payment_method || "Mobile Payment",
          });
        } else {
          // ❌ Payment failed at gateway
          registration.paymentStatus = "Failed";
          await registration.save();
          console.error(
            "Payment failed at PayStation:",
            invoice_number,
            trxStatus,
          );
        }
      } else {
        // ❌ PayStation verification failed
        registration.paymentStatus = "Failed";
        await registration.save();
        console.error(
          "PayStation API verification failed",
          invoice_number,
          data,
        );
      }
    } else {
      // ❌ User redirected with failed/cancelled payment
      registration.paymentStatus = "Failed";
      await registration.save();
      console.error("Payment status not Successful:", invoice_number, status);
    }

    return NextResponse.redirect(new URL("/registration", req.url));
  } catch (err) {
    console.error("Payment callback error:", err);
    return NextResponse.redirect(new URL("/registration", req.url));
  }
}
