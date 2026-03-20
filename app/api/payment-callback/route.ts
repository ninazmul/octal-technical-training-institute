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
        const paidAmount = parseFloat(trx.payment_amount);
        const expectedAmount = parseFloat(registration.paymentAmount);

        if (
          trxStatus === "success" &&
          Math.abs(paidAmount - expectedAmount) < 0.01
        ) {
          await confirmRegistrationPayment(invoice_number, {
            transactionId: trx_id || trx.trx_id,
            paymentMethod: trx.payment_method || "Mobile Payment",
          });
        } else {
          registration.paymentStatus = "Failed";
          await registration.save();
          console.error("Payment verification failed", {
            invoice_number,
            trxStatus,
            paidAmount,
            expectedAmount,
          });
        }
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
