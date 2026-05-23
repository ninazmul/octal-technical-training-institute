import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Registration from "@/lib/database/models/registration.model";
import Course from "@/lib/database/models/course.model";
import { validateCoupon } from "@/lib/actions/coupon.actions";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const course = await Course.findById(body.courseId);
    if (!course) {
      return NextResponse.json({ success: false });
    }

    const coursePriceType = body.coursePriceType === "rtl" ? "rtl" : "rto";
    const originalAmount =
      coursePriceType === "rtl" && course.rtlPrice
        ? course.rtlPrice
        : course.discountPrice ?? course.price;
    const couponCode =
      typeof body.couponCode === "string" ? body.couponCode.trim() : "";
    const couponResult = couponCode
      ? await validateCoupon(couponCode, originalAmount)
      : null;

    if (couponCode && !couponResult?.valid) {
      return NextResponse.json({
        success: false,
        message: couponResult?.message ?? "Invalid coupon",
      });
    }

    const paymentAmount = couponResult?.valid
      ? couponResult.finalAmount
      : originalAmount;
    const couponDiscount = couponResult?.valid
      ? couponResult.discountAmount
      : 0;

    const registration = await Registration.create({
      ...body,
      course: body.courseId, // 🔥 FIX HERE
      coursePriceType,
      originalPaymentAmount: originalAmount,
      couponCode: couponResult?.valid ? couponResult.code : undefined,
      couponDiscount,
      paymentAmount,
      paymentStatus: paymentAmount > 0 ? "Pending" : "Paid",
    });

    return NextResponse.json({
      success: true,
      registrationId: registration._id,
      paymentRequired: paymentAmount > 0,
      originalAmount,
      discountAmount: couponDiscount,
      finalAmount: paymentAmount,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false });
  }
}
