import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Registration from "@/lib/database/models/registration.model";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const { registrationId } = await req.json();
    const registration = await Registration.findById(registrationId);
    if (!registration) {
      return NextResponse.json({
        status: "failed",
        reason: "Registration not found",
      });
    }

    // ✅ Mandatory fields
    const custName = registration.englishName || "Customer";
    const custEmail =
      registration.email && registration.email.includes("@")
        ? registration.email
        : "test@example.com";
    const custPhone =
      registration.number && /^\d+$/.test(registration.number)
        ? registration.number
        : "01700000000";

    const params = new URLSearchParams({
      merchantId: process.env.NEXT_PUBLIC_PAYSTATION_MERCHANT_ID!,
      password: process.env.NEXT_PUBLIC_PAYSTATION_PASSWORD!,
      invoice_number: registration._id.toString(),
      currency: "BDT",
      payment_amount: registration.paymentAmount?.toString() || "1",
      pay_with_charge: "1",
      reference: "Course Registration",
      cust_name: custName,
      cust_phone: custPhone,
      cust_email: custEmail,
      cust_address: registration.address || "Dhaka, Bangladesh",
      callback_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/payment-callback`,
      checkout_items: JSON.stringify([{ name: "Course", qty: 1 }]),
    });

    console.log("Sending to PayStation:", params.toString());

    const res = await fetch("https://api.paystation.com.bd/initiate-payment", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });

    const data = await res.json();
    console.log("PayStation initiate response:", data);

    if (data?.status_code === "200" && data?.payment_url) {
      // ✅ Redirect user to PayStation checkout page
      return NextResponse.redirect(data.payment_url);
    }

    registration.paymentStatus = "Failed";
    await registration.save();
    return NextResponse.json({
      status: "failed",
      reason: data?.message || "Payment initiation failed",
    });
  } catch (err) {
    console.error("Initiate payment error:", err);
    return NextResponse.json({ status: "failed", reason: "Server error" });
  }
}
