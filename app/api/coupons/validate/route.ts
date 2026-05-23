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

    const amount = course.discountPrice ?? course.price ?? 0;
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
