import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Registration from "@/lib/database/models/registration.model";
import { confirmRegistrationPayment } from "@/lib/actions/registration.actions";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const url = new URL(
      req.url,
      process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000",
    );
    const invoice_number = url.searchParams.get("invoice_number");
    const status = url.searchParams.get("status")?.toLowerCase();
    let trx_id = url.searchParams.get("trx_id");

    console.log("Payment callback received:", {
      invoice_number,
      status,
      trx_id,
    });

    if (!invoice_number) {
      return NextResponse.redirect(
        new URL("/registration", process.env.NEXT_PUBLIC_SERVER_URL),
      );
    }

    const registration = await Registration.findById(invoice_number);
    if (!registration) {
      return NextResponse.redirect(
        new URL("/registration", process.env.NEXT_PUBLIC_SERVER_URL),
      );
    }

    if (status === "successful") {
      // 🔒 If trx_id is missing, query PayStation transaction-status API
      if (!trx_id || trx_id === "N/A") {
        try {
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
          console.log("Transaction-status response:", data);

          if (data?.status_code === "200" && data?.data?.trx_id) {
            trx_id = data.data.trx_id;
          }
        } catch (err) {
          console.error("Transaction-status lookup failed:", err);
        }
      }

      console.log(
        "Confirming payment for",
        invoice_number,
        "with trx_id:",
        trx_id,
      );
      const confirmed = await confirmRegistrationPayment(invoice_number, {
        transactionId: trx_id || "N/A",
        paymentMethod: "Mobile Payment",
      });
      console.log("Registration updated:", confirmed);
    } else {
      registration.paymentStatus = "Failed";
      await registration.save();
      console.error("Payment not successful:", invoice_number, status);
    }

    return NextResponse.redirect(
      new URL("/registration", process.env.NEXT_PUBLIC_SERVER_URL),
    );
  } catch (err) {
    console.error("Payment callback error:", err);
    return NextResponse.redirect(
      new URL("/registration", process.env.NEXT_PUBLIC_SERVER_URL),
    );
  }
}
