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
    const status = url.searchParams.get("status");
    const trx_id = url.searchParams.get("trx_id");

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

    if (status === "Successful") {
      await confirmRegistrationPayment(invoice_number, {
        transactionId: trx_id || "N/A",
        paymentMethod: "PayStation",
      });
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
