import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Registration from "@/lib/database/models/registration.model";
import Course from "@/lib/database/models/course.model";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const course = await Course.findById(body.courseId);
    if (!course) {
      return NextResponse.json({ success: false });
    }

    const amount = course.discountPrice ?? course.price;

    const registration = await Registration.create({
      ...body,
      course: body.courseId, // 🔥 FIX HERE
      paymentAmount: amount,
      paymentStatus: "Pending",
    });

    return NextResponse.json({
      success: true,
      registrationId: registration._id,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false });
  }
}
