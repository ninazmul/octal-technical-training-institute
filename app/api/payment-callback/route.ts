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

    if (!invoice_number) {
      return NextResponse.redirect(new URL("/registration", req.url));
    }

    const registration = await Registration.findById(invoice_number);
    if (!registration) {
      return NextResponse.redirect(new URL("/registration", req.url));
    }

    if (status === "Successful") {
      // 1️⃣ Verify payment with PayStation
      const res = await fetch(
        "https://api.paystation.com.bd/transaction-status",
        {
          method: "POST",
          headers: {
            merchantId: process.env.NEXT_PUBLIC_PAYSTATION_MERCHANT_ID!,
          },
          body: new URLSearchParams({
            invoice_number,
          }),
        },
      );

      const data = await res.json();

      if (data.status_code === "200") {
        const trx = data.data;

        // 2️⃣ Validate transaction status
        if (trx.trx_status?.toLowerCase() === "success") {
          // 3️⃣ Validate amount
          const paidAmount = Number(trx.payment_amount);
          const expectedAmount = Number(registration.paymentAmount);
          if (paidAmount === expectedAmount) {
            // 4️⃣ Confirm payment (updates registration & seat reduction)
            await confirmRegistrationPayment(invoice_number, {
              transactionId: trx_id || trx.trx_id,
              paymentMethod: trx.payment_method || "Mobile Payment",
            });
          } else {
            console.error("Amount mismatch for registration", invoice_number);
            registration.paymentStatus = "Failed";
            await registration.save();
          }
        } else {
          registration.paymentStatus = "Failed";
          await registration.save();
        }
      } else {
        console.error("PayStation verification failed", data);
        registration.paymentStatus = "Failed";
        await registration.save();
      }
    } else {
      // Payment failed or cancelled
      registration.paymentStatus = "Failed";
      await registration.save();
    }

    // ✅ Redirect user to registration page
    return NextResponse.redirect(new URL("/registration", req.url));
  } catch (err) {
    console.error("Payment callback error:", err);
    return NextResponse.redirect(new URL("/registration", req.url));
  }
}
