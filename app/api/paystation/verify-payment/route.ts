import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Registration from "@/lib/database/models/registration.model";
import { confirmRegistrationPayment } from "@/lib/actions/registration.actions";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const { invoice_number } = await req.json();

    if (!invoice_number) {
      return NextResponse.json({ success: false, message: "Missing invoice" });
    }

    // 🔍 1. Get registration
    const registration = await Registration.findById(invoice_number);
    if (!registration) {
      return NextResponse.json({ success: false, message: "Invalid invoice" });
    }

    // 🔒 2. Verify with PayStation
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

    if (data.status_code !== "200") {
      return NextResponse.json({
        success: false,
        message: "Verification failed",
      });
    }

    const trx = data.data;

    // 🔒 3. Validate transaction status
    if (trx.trx_status?.toLowerCase() !== "success") {
      // mark failed safely
      if (registration.paymentStatus !== "Paid") {
        registration.paymentStatus = "Failed";
        await registration.save();
      }

      return NextResponse.json({
        success: false,
        message: "Payment not successful",
      });
    }

    // 🔥 4. CRITICAL: Validate amount (anti-tampering)
    const paidAmount = Number(trx.payment_amount);
    const expectedAmount = Number(registration.paymentAmount);

    if (paidAmount !== expectedAmount) {
      return NextResponse.json({
        success: false,
        message: "Amount mismatch",
      });
    }

    // 🔒 5. Idempotency (double protection)
    if (registration.paymentStatus === "Paid") {
      return NextResponse.json({ success: true });
    }

    // ✅ 6. Confirm payment (THIS handles seat reduction)
    await confirmRegistrationPayment(invoice_number, {
      transactionId: trx.trx_id,
      paymentMethod: trx.payment_method,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({
      success: false,
      message: "Server error",
    });
  }
}
