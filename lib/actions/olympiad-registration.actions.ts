"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/database";
import OlympiadRegistration, {
  IOlympiadRegistration,
} from "@/lib/database/models/olympiad-registration.model";
import Olympiad, { IOlympiad } from "@/lib/database/models/olympiad.model";
import OlympiadNotificationLog from "@/lib/database/models/olympiad-notification.model";
import { toBulkSmsBdNumber } from "@/lib/mailer/bulksms";
import Counter from "@/lib/database/models/counter.model";
import {
  formatDhakaDateTime,
  getOlympiadLifecycleState,
} from "@/lib/olympiad-lifecycle";
import {
  createOlympiadTransporter,
  dispatchRegistrationConfirmation,
  sendOlympiadEmail,
  sendOlympiadSMS,
} from "@/lib/mailer/olympiad-notifications";
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
  photo?: string;
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

/**
 * Runs tasks in fixed-size batches so a bulk dispatch never opens hundreds of
 * SMTP / gateway connections at the same instant. Returns the success count.
 */
async function runInBatches<T>(
  items: T[],
  batchSize: number,
  task: (item: T) => Promise<boolean>,
): Promise<number> {
  let succeeded = 0;
  for (let i = 0; i < items.length; i += batchSize) {
    const results = await Promise.all(items.slice(i, i + batchSize).map(task));
    succeeded += results.filter(Boolean).length;
  }
  return succeeded;
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
      photo: data.photo?.trim(),
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

    // Fetch latest notification logs for these registrants to show delivery status
    const phoneNumbers = registrations.map((r) => toBulkSmsBdNumber(r.phoneNumber));
    const latestLogs = await OlympiadNotificationLog.find({
      olympiadId,
      recipientPhone: { $in: phoneNumbers },
    })
      .sort({ sentAt: -1 })
      .lean();

    const registrationsWithStatus = registrations.map((reg) => {
      const normalized = toBulkSmsBdNumber(reg.phoneNumber);
      const lastLog = latestLogs.find((l) => l.recipientPhone === normalized);
      return {
        ...reg,
        lastNotification: lastLog
          ? {
              status: lastLog.status,
              error: lastLog.error,
              sentAt: lastLog.sentAt,
              type: lastLog.type,
            }
          : null,
      };
    });

    return {
      registrations: JSON.parse(JSON.stringify(registrationsWithStatus)),
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

export type RegistrationUpdateInput = {
  studentName?: string;
  email?: string;
  phoneNumber?: string;
  institution?: string;
  grade?: string;
  rollNumber?: string;
  district?: string;
  dateOfBirth?: string;
  guardianPhone?: string;
  photo?: string;
};

/**
 * Lets an admin correct a participant's registration details (typos, changed
 * phone, etc.) after submission. Re-validates the same rules the public form
 * enforces and guards the per-olympiad unique email constraint.
 */
export async function updateRegistrationAdmin(
  registrationId: string,
  data: RegistrationUpdateInput,
) {
  try {
    const { sessionClaims } = await auth();
    const userId = sessionClaims?.userId as string;
    const email = await getUserEmailById(userId);
    if (!email || !(await isAdmin(email))) throw new Error("Forbidden");

    await connectToDatabase();

    const registration = await OlympiadRegistration.findById(registrationId);
    if (!registration) throw new Error("Registration not found");

    if (data.studentName !== undefined) {
      if (!data.studentName.trim()) throw new Error("Student name is required.");
      registration.studentName = data.studentName.trim();
    }

    if (data.email !== undefined) {
      const normalized = data.email.toLowerCase().trim();
      if (!validateEmail(normalized)) {
        throw new Error("A valid email address is required.");
      }
      if (normalized !== registration.email) {
        const conflict = await OlympiadRegistration.findOne({
          olympiadId: registration.olympiadId,
          email: normalized,
          status: "Confirmed",
          _id: { $ne: registrationId },
        });
        if (conflict) {
          throw new Error(
            "Another confirmed registration already uses this email address.",
          );
        }
      }
      registration.email = normalized;
    }

    if (data.phoneNumber !== undefined) {
      if (!validateBangladeshPhone(data.phoneNumber.trim())) {
        throw new Error(
          "A valid Bangladesh phone number is required (e.g. 017XXXXXXXX).",
        );
      }
      registration.phoneNumber = data.phoneNumber.trim();
    }

    if (data.institution !== undefined) {
      if (!data.institution.trim()) throw new Error("Institution is required.");
      registration.institution = data.institution.trim();
    }

    if (data.grade !== undefined) {
      if (!data.grade.trim()) throw new Error("Class/Grade is required.");
      registration.grade = data.grade.trim();
    }

    if (data.rollNumber !== undefined) {
      if (!data.rollNumber.trim()) throw new Error("Roll/ID number is required.");
      registration.rollNumber = data.rollNumber.trim();
    }

    if (data.district !== undefined) registration.district = data.district.trim();
    if (data.dateOfBirth !== undefined)
      registration.dateOfBirth = data.dateOfBirth.trim();
    if (data.guardianPhone !== undefined)
      registration.guardianPhone = data.guardianPhone.trim();
    if (data.photo !== undefined) registration.photo = data.photo.trim();

    await registration.save();

    await logActivity(
      "UPDATE",
      "OlympiadRegistration",
      `Updated registration details for ${registration.registrationNumber} (${registration.studentName})`,
    );

    revalidatePath(`/dashboard/olympiads/${registration.olympiadId}`);
    return {
      success: true,
      registration: JSON.parse(JSON.stringify(registration)),
    };
  } catch (error) {
    handleError(error);
  }
}

// -------------------- Admin Bulk Messaging --------------------

/**
 * Sends a bulk SMS or email to selected confirmed registrants of an Olympiad,
 * using each participant's registered contact details. Every dispatch is
 * recorded in the Olympiad notification log for auditing.
 */
export async function sendBulkMessageToRegistrants({
  olympiadId,
  registrationIds,
  channel,
  subject,
  html,
  message,
}: {
  olympiadId: string;
  registrationIds: string[];
  channel: "email" | "sms";
  subject?: string;
  html?: string;
  message?: string;
}): Promise<{
  success: boolean;
  sent: number;
  failed: number;
  total: number;
  error?: string;
}> {
  try {
    const { sessionClaims } = await auth();
    const userId = sessionClaims?.userId as string;
    const adminEmail = await getUserEmailById(userId);
    if (!adminEmail || !(await isAdmin(adminEmail))) {
      throw new Error("Forbidden: Admin privileges required");
    }

    await connectToDatabase();

    if (!registrationIds?.length) {
      throw new Error("Select at least one participant.");
    }

    const recipients = await OlympiadRegistration.find({
      _id: { $in: registrationIds },
      olympiadId,
      status: "Confirmed",
    }).lean<IOlympiadRegistration[]>();

    if (recipients.length === 0) {
      throw new Error("No confirmed registrations matched the selection.");
    }

    // Unique per dispatch so admins can legitimately re-send the same message.
    const batchKey = Date.now();
    let sent = 0;
    // First provider error, surfaced to the admin when deliveries fail.
    let firstError: string | undefined;

    if (channel === "email") {
      if (!subject?.trim() || !html?.trim()) {
        throw new Error("Email subject and body are required.");
      }

      const transporter = createOlympiadTransporter();
      if (!transporter) {
        throw new Error("SMTP credentials are not configured on the server.");
      }

      const targetSubject = subject.trim();
      const targetHtml = html;

      sent = await runInBatches(recipients, 5, (reg) =>
        sendOlympiadEmail({
          olympiadId,
          email: reg.email,
          recipientName: reg.studentName,
          subject: targetSubject,
          htmlContent: targetHtml,
          type: "CUSTOM",
          idempotencyKey: `CUSTOM_EMAIL_${String(reg._id)}_${batchKey}`,
          transporter,
        }),
      );
    } else {
      if (!message?.trim()) {
        throw new Error("SMS message is required.");
      }

      const targetMessage = message.trim();

      sent = await runInBatches(recipients, 10, async (reg) => {
        const result = await sendOlympiadSMS({
          olympiadId,
          number: reg.phoneNumber,
          message: targetMessage,
          type: "CUSTOM",
          idempotencyKey: `CUSTOM_SMS_${String(reg._id)}_${batchKey}`,
          recipientName: reg.studentName,
        });
        if (!result.success && result.error && !firstError) {
          firstError = `${reg.phoneNumber}: ${result.error}`;
        }
        return result.success;
      });
    }

    await logActivity(
      "UPDATE",
      "OlympiadRegistration",
      `Sent bulk ${channel.toUpperCase()} to ${sent}/${recipients.length} participant(s) of Olympiad ${olympiadId}`,
    );

    return {
      success: true,
      sent,
      failed: recipients.length - sent,
      total: recipients.length,
      error: firstError,
    };
  } catch (error: any) {
    handleError(error);
    return {
      success: false,
      sent: 0,
      failed: 0,
      total: 0,
      error: error?.message || "Failed to send bulk message.",
    };
  }
}

/**
 * Manual "exam starts in 1 hour" SMS blast to every confirmed registrant.
 * Invoked by an admin from the Olympiad hub; each dispatch gets a fresh
 * idempotency key so an intentional re-send is possible.
 */
export async function sendExamReminderSmsToAllRegistrants(olympiadId: string): Promise<{
  success: boolean;
  sent: number;
  failed: number;
  total: number;
  error?: string;
}> {
  try {
    const { sessionClaims } = await auth();
    const userId = sessionClaims?.userId as string;
    const adminEmail = await getUserEmailById(userId);
    if (!adminEmail || !(await isAdmin(adminEmail))) {
      throw new Error("Forbidden: Admin privileges required");
    }

    await connectToDatabase();

    const olympiad = await Olympiad.findById(olympiadId).lean<IOlympiad>();
    if (!olympiad) throw new Error("Olympiad not found.");

    const recipients = await OlympiadRegistration.find({
      olympiadId,
      status: "Confirmed",
    }).lean<IOlympiadRegistration[]>();

    if (recipients.length === 0) {
      throw new Error("There are no confirmed registrants to notify.");
    }

    const formattedExamTime = formatDhakaDateTime(olympiad.examStartDate);
    const examUrl = `${process.env.NEXT_PUBLIC_SERVER_URL || "https://octal.edu.bd"}/olympiads/${olympiad.slug}/exam`;
    const batchKey = Date.now();
    let firstError: string | undefined;

    const sent = await runInBatches(recipients, 10, async (reg) => {
      const message = `Dear ${reg.studentName}, your ${olympiad.title} exam starts in 1 hour at ${formattedExamTime} (Dhaka). Reg No: ${reg.registrationNumber}. Join: ${examUrl} - Octal TTI`;
      const result = await sendOlympiadSMS({
        olympiadId,
        number: reg.phoneNumber,
        message,
        type: "REMINDER_1H",
        idempotencyKey: `REMINDER_1H_SMS_${String(reg._id)}_${batchKey}`,
        recipientName: reg.studentName,
      });
      if (!result.success && result.error && !firstError) {
        firstError = `${reg.phoneNumber}: ${result.error}`;
      }
      return result.success;
    });

    await logActivity(
      "UPDATE",
      "OlympiadRegistration",
      `Sent 1-hour exam reminder SMS to ${sent}/${recipients.length} registrant(s) of Olympiad ${olympiadId}`,
    );

    return {
      success: true,
      sent,
      failed: recipients.length - sent,
      total: recipients.length,
      error: firstError,
    };
  } catch (error: any) {
    handleError(error);
    return {
      success: false,
      sent: 0,
      failed: 0,
      total: 0,
      error: error?.message || "Failed to send exam reminder SMS.",
    };
  }
}
