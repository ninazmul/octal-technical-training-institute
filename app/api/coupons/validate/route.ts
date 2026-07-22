import { NextRequest, NextResponse } from "next/server";
import { validateCoupon } from "@/lib/actions/coupon.actions";
import { connectToDatabase } from "@/lib/database";
import Course from "@/lib/database/models/course.model";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const course = await Course.findById(body.courseId).lean<{
      price?: number;
      discountPrice?: number;
      rplPrice?: number;
    }>();

    if (!course) {
      return NextResponse.json(
        {
          valid: false,
          message: "Course not found",
        },
        { status: 404 },
      );
    }

    const priceType = body.coursePriceType === "rpl" ? "rpl" : "rto";

    if (priceType === "rpl") {
      const rplAmt = Number(course.rplPrice ?? 0);
      return NextResponse.json({
        valid: false,
        message: "Coupons are not applicable for RPL price",
        originalAmount: rplAmt,
        discountAmount: 0,
        finalAmount: rplAmt,
      });
    }

    const hasDiscount =
      course.discountPrice !== undefined &&
      course.discountPrice !== null &&
      String(course.discountPrice).trim() !== "" &&
      Number(course.discountPrice) > 0;

    const amount = hasDiscount
      ? Number(course.discountPrice)
      : Number(course.price ?? 0);

    const result = await validateCoupon(String(body.code ?? ""), amount);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Coupon validation error:", error);
    return NextResponse.json(
      {
        valid: false,
        message: "Unable to validate coupon",
      },
      { status: 500 },
    );
  }
}
