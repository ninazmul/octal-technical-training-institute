import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Registration from "@/lib/database/models/registration.model";
import { confirmRegistrationPayment } from "@/lib/actions/registration.actions";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const { registrationId } = await req.json();

    const registration = await Registration.findById(registrationId);
    if (!registration) {
      return NextResponse.redirect(
        new URL("/registration", process.env.NEXT_PUBLIC_SERVER_URL),
      );
    }

    // 🔒 Initiate payment with PayStation
    const res = await fetch("https://api.paystation.com.bd/initiate-payment", {
      method: "POST",
      body: new URLSearchParams({
        merchantId: process.env.NEXT_PUBLIC_PAYSTATION_MERCHANT_ID!,
        password: process.env.NEXT_PUBLIC_PAYSTATION_PASSWORD!,
        invoice_number: registration._id.toString(),
        currency: "BDT",
        payment_amount: registration.paymentAmount?.toString() || "1",
        cust_name: registration.englishName || "N/A",
        cust_email: registration.email || "N/A",
        cust_phone: registration.number || "N/A",
        checkout_items: JSON.stringify([{ name: "Course", qty: 1 }]),
      }),
    });

    const data = await res.json();
    console.log("PayStation initiate response:", data);

    if (data?.status_code === "200" && data?.trx_id) {
      // ✅ Confirm payment immediately
      await confirmRegistrationPayment(registration._id.toString(), {
        transactionId: data.trx_id,
        paymentMethod: "PayStation",
      });

      // Push user to registration page
      return NextResponse.redirect(
        new URL("/registration", process.env.NEXT_PUBLIC_SERVER_URL),
      );
    }

    // ❌ Mark as failed
    registration.paymentStatus = "Failed";
    await registration.save();

    return NextResponse.redirect(
      new URL("/registration", process.env.NEXT_PUBLIC_SERVER_URL),
    );
  } catch (err) {
    console.error("Initiate payment error:", err);
    return NextResponse.redirect(
      new URL("/registration", process.env.NEXT_PUBLIC_SERVER_URL),
    );
  }
}
