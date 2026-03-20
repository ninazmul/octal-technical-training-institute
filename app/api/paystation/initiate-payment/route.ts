import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Registration from "@/lib/database/models/registration.model";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const { registrationId } = await req.json();

    const registration = await Registration.findById(registrationId);
    if (!registration) {
      return NextResponse.json({ status: "failed" });
    }

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

        // ✅ This is the key:
        callback_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/payment-callback`,
      }),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "failed" });
  }
}
