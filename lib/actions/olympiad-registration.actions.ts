"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/database";
import OlympiadRegistration, {
  IOlympiadRegistration,
} from "@/lib/database/models/olympiad-registration.model";
import Olympiad, { IOlympiad } from "@/lib/database/models/olympiad.model";
import Counter from "@/lib/database/models/counter.model";
import { getOlympiadLifecycleState } from "@/lib/olympiad-lifecycle";
import { dispatchRegistrationConfirmation } from "@/lib/mailer/olympiad-notifications";
import { logActivity } from "@/lib/actions/activity-log.actions";
import { handleError } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { getUserEmailById } from "@/lib/actions/user.actions";
import { isAdmin } from "@/lib/actions/admin.actions";

export type RegistrationInput = {
  olympiadId: string;
  studentName: string;
  email: string;
  phoneNumber: string;
  institution: string;
  grade: string;
  rollNumber: string;
  district?: string;
  dateOfBirth?: string;
  guardianPhone?: string;
  customData?: Record<string, any>;
};

function validateBangladeshPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s+-]/g, "");
  // Accept standard BD patterns: 013, 014, 015, 016, 017, 018, 019
  return /^(?:8801|01)[3-9]\d{8}$/.test(cleaned);
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function registerForOlympiad(data: RegistrationInput) {
  try {
    await connectToDatabase();

    // 1. Validation
    if (!data.studentName?.trim()) throw new Error("Student full name is required.");
    if (!data.email?.trim() || !validateEmail(data.email.trim())) {
      throw new Error("A valid email address is required.");
    }
    if (!data.phoneNumber?.trim() || !validateBangladeshPhone(data.phoneNumber.trim())) {
      throw new Error("A valid Bangladesh phone number is required (e.g. 017XXXXXXXX).");
    }
    if (!data.institution?.trim()) throw new Error("Institution/School name is required.");
    if (!data.grade?.trim()) throw new Error("Class/Grade is required.");
    if (!data.rollNumber?.trim()) throw new Error("Roll/ID number is required.");

    const normalizedEmail = data.email.toLowerCase().trim();
    const normalizedPhone = data.phoneNumber.trim();

    // 2. Fetch Olympiad and verify lifecycle window
    const olympiad = await Olympiad.findById(data.olympiadId).lean<IOlympiad>();
    if (!olympiad) throw new Error("Olympiad not found.");

    const lifecycle = getOlympiadLifecycleState(olympiad);
    if (!lifecycle.canRegister) {
      if (lifecycle.state === "scheduled") {
        throw new Error("Registration has not opened yet for this Olympiad.");
      }
      throw new Error("Registration is currently closed for this Olympiad.");
    }

    // 3. Enforce maximum capacity limit under concurrent requests
    if (olympiad.maxCapacity && olympiad.maxCapacity > 0) {
      const activeCount = await OlympiadRegistration.countDocuments({
        olympiadId: data.olympiadId,
        status: "Confirmed",
      });
      if (activeCount >= olympiad.maxCapacity) {
        throw new Error(
          "Registration is closed: Maximum participant capacity has been reached.",
        );
      }
    }

    // 4. Duplicate registration check (one valid registration per email or phone)
    const existing = await OlympiadRegistration.findOne({
      olympiadId: data.olympiadId,
      status: "Confirmed",
      $or: [{ email: normalizedEmail }, { phoneNumber: normalizedPhone }],
    });

    if (existing) {
      throw new Error(
        existing.email === normalizedEmail
          ? "This email address is already registered for this Olympiad."
          : "This phone number is already registered for this Olympiad.",
      );
    }

    // 5. Generate sequential Registration Number via Atomic Counter
    const year = new Date().getFullYear();
    const counterDoc = await Counter.findOneAndUpdate(
      { name: `olympiad_reg_${year}` },
      { $inc: { seq: 1 } },
      { upsert: true, new: true },
    );
    const seqNumber = String(counterDoc.seq).padStart(4, "0");
    const registrationNumber = `OLY-${year}-${seqNumber}`;

    // 6. Associate logged-in student clerk ID if present
    let clerkUserId: string | undefined;
    try {
      const { sessionClaims } = await auth();
      clerkUserId = sessionClaims?.userId as string;
    } catch {}

    // 7. Persist Registration Record
    const registration = await OlympiadRegistration.create({
      olympiadId: data.olympiadId,
      registrationNumber,
      studentName: data.studentName.trim(),
      email: normalizedEmail,
      phoneNumber: normalizedPhone,
      institution: data.institution.trim(),
      grade: data.grade.trim(),
      rollNumber: data.rollNumber.trim(),
      district: data.district?.trim(),
      dateOfBirth: data.dateOfBirth?.trim(),
      guardianPhone: data.guardianPhone?.trim(),
      customData: data.customData,
      clerkUserId,
      status: "Confirmed",
    });

    // 8. Fire-and-forget notification dispatch
    dispatchRegistrationConfirmation({
      olympiadId: data.olympiadId,
      olympiadTitle: olympiad.title,
      registrationNumber,
      studentName: data.studentName.trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      examStartDate: olympiad.examStartDate,
      durationMinutes: olympiad.durationMinutes,
      slug: olympiad.slug,
    });

    revalidatePath(`/olympiads/${olympiad.slug}`);
    revalidatePath(`/dashboard/olympiads/${olympiad._id}`);

    return {
      success: true,
      registrationNumber,
      registrationId: String(registration._id),
      olympiadTitle: olympiad.title,
      slug: olympiad.slug,
    };
  } catch (error) {
    handleError(error);
  }
}

export async function getOlympiadRegistrationsAdmin(
  olympiadId: string,
  options?: {
    search?: string;
    grade?: string;
    page?: number;
    limit?: number;
  },
) {
  try {
    const { sessionClaims } = await auth();
    const userId = sessionClaims?.userId as string;
    if (!userId) throw new Error("Unauthorized");
    const email = await getUserEmailById(userId);
    if (!email || !(await isAdmin(email))) throw new Error("Forbidden");

    await connectToDatabase();

    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const query: any = { olympiadId };
    if (options?.grade && options.grade !== "all") {
      query.grade = options.grade;
    }
    if (options?.search) {
      const regex = new RegExp(options.search, "i");
      query.$or = [
        { studentName: regex },
        { email: regex },
        { phoneNumber: regex },
        { registrationNumber: regex },
        { institution: regex },
      ];
    }

    const [registrations, totalCount] = await Promise.all([
      OlympiadRegistration.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<IOlympiadRegistration[]>(),
      OlympiadRegistration.countDocuments(query),
    ]);

    return {
      registrations: JSON.parse(JSON.stringify(registrations)),
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    };
  } catch (error) {
    handleError(error);
    return { registrations: [], totalCount: 0, totalPages: 0, currentPage: 1 };
  }
}

export async function cancelRegistrationAdmin(registrationId: string) {
  try {
    const { sessionClaims } = await auth();
    const userId = sessionClaims?.userId as string;
    const email = await getUserEmailById(userId);
    if (!email || !(await isAdmin(email))) throw new Error("Forbidden");

    await connectToDatabase();
    const registration = await OlympiadRegistration.findByIdAndUpdate(
      registrationId,
      { status: "Cancelled" },
      { new: true },
    );

    if (!registration) throw new Error("Registration not found");

    await logActivity(
      "UPDATE",
      "OlympiadRegistration",
      `Cancelled registration ${registration.registrationNumber} (${registration.studentName})`,
    );

    revalidatePath(`/dashboard/olympiads/${registration.olympiadId}`);
    return { success: true };
  } catch (error) {
    handleError(error);
  }
}
