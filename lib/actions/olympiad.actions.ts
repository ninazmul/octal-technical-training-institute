"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/database";
import Olympiad, {
  IOlympiad,
  OlympiadStatus,
} from "@/lib/database/models/olympiad.model";
import OlympiadQuestion from "@/lib/database/models/olympiad-question.model";
import OlympiadRegistration from "@/lib/database/models/olympiad-registration.model";
import OlympiadAttempt from "@/lib/database/models/olympiad-attempt.model";
import { logActivity } from "@/lib/actions/activity-log.actions";
import { handleError } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { getUserEmailById } from "@/lib/actions/user.actions";
import { isAdmin } from "@/lib/actions/admin.actions";
import { getOlympiadLifecycleState } from "@/lib/olympiad-lifecycle";

async function verifyAdminAuth(): Promise<{ email: string }> {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;
  if (!userId) throw new Error("Unauthorized: Authentication required");

  const email = await getUserEmailById(userId);
  if (!email) throw new Error("Unauthorized: Email not resolved");

  const authorized = await isAdmin(email);
  if (!authorized) throw new Error("Forbidden: Admin privileges required");

  return { email };
}

export type OlympiadFormValues = {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  banner?: string;
  category: string;
  targetClasses: string[];
  eligibility?: string;
  organizer?: string;
  registrationStartDate: string;
  registrationDeadline: string;
  examStartDate: string;
  examEndDate: string;
  durationMinutes: number;
  maxCapacity?: number;
  totalMarks?: number;
  passingMarks?: number;
  negativeMarking?: {
    enabled: boolean;
    penaltyPerQuestion: number;
  };
  randomizeQuestions?: boolean;
  randomizeOptions?: boolean;
  allowBackNavigation?: boolean;
  allowReview?: boolean;
  showResultsImmediately?: boolean;
  resultsPublishDate: string;
  isResultsPublic?: boolean;
  instructions?: string;
  rules?: string;
  prizes?: string;
  status?: OlympiadStatus;
  customFields?: Array<{
    fieldName: string;
    fieldLabel: string;
    fieldType: "text" | "number" | "select";
    required: boolean;
    options?: string[];
  }>;
};

// -------------------- Admin CRUD --------------------

export async function createOlympiad(data: OlympiadFormValues) {
  try {
    const { email } = await verifyAdminAuth();
    await connectToDatabase();

    // Verify slug uniqueness
    const existing = await Olympiad.findOne({
      slug: data.slug.toLowerCase().trim(),
    });
    if (existing) {
      throw new Error(`An Olympiad with slug "${data.slug}" already exists.`);
    }

    const olympiad = await Olympiad.create({
      ...data,
      slug: data.slug.toLowerCase().trim(),
      createdBy: email,
      updatedBy: email,
    });

    await logActivity(
      "CREATE",
      "Olympiad",
      `Created Olympiad "${olympiad.title}" (slug: ${olympiad.slug})`,
    );

    revalidatePath("/dashboard/olympiads");
    revalidatePath("/olympiads");
    return JSON.parse(JSON.stringify(olympiad));
  } catch (error) {
    handleError(error);
  }
}

export async function updateOlympiad(id: string, data: Partial<OlympiadFormValues>) {
  try {
    const { email } = await verifyAdminAuth();
    await connectToDatabase();

    const existing = await Olympiad.findById(id);
    if (!existing) throw new Error("Olympiad not found");

    // If slug is changing, verify uniqueness
    if (data.slug && data.slug.toLowerCase().trim() !== existing.slug) {
      const duplicate = await Olympiad.findOne({
        slug: data.slug.toLowerCase().trim(),
        _id: { $ne: id },
      });
      if (duplicate) {
        throw new Error(`Slug "${data.slug}" is already in use by another Olympiad.`);
      }
    }

    const updated = await Olympiad.findByIdAndUpdate(
      id,
      {
        ...data,
        ...(data.slug && { slug: data.slug.toLowerCase().trim() }),
        updatedBy: email,
      },
      { new: true, runValidators: true },
    );

    await logActivity(
      "UPDATE",
      "Olympiad",
      `Updated Olympiad "${updated.title}"`,
    );

    revalidatePath("/dashboard/olympiads");
    revalidatePath(`/dashboard/olympiads/${id}`);
    revalidatePath(`/olympiads/${updated.slug}`);
    revalidatePath("/olympiads");

    return JSON.parse(JSON.stringify(updated));
  } catch (error) {
    handleError(error);
  }
}

export async function deleteOlympiad(id: string) {
  try {
    await verifyAdminAuth();
    await connectToDatabase();

    // Prevent deletion if student attempts or registrations already exist
    const [registrationCount, attemptCount] = await Promise.all([
      OlympiadRegistration.countDocuments({ olympiadId: id }),
      OlympiadAttempt.countDocuments({ olympiadId: id }),
    ]);

    if (registrationCount > 0 || attemptCount > 0) {
      throw new Error(
        `Cannot delete Olympiad with existing records (${registrationCount} registrations, ${attemptCount} attempts). Please archive it instead.`,
      );
    }

    const deleted = await Olympiad.findByIdAndDelete(id);
    if (!deleted) throw new Error("Olympiad not found");

    // Also clean up questions
    await OlympiadQuestion.deleteMany({ olympiadId: id });

    await logActivity(
      "DELETE",
      "Olympiad",
      `Deleted Olympiad "${deleted.title}" and its questions`,
    );

    revalidatePath("/dashboard/olympiads");
    revalidatePath("/olympiads");
    return { success: true };
  } catch (error) {
    handleError(error);
  }
}

export async function duplicateOlympiad(id: string) {
  try {
    const { email } = await verifyAdminAuth();
    await connectToDatabase();

    const original = await Olympiad.findById(id).lean<IOlympiad>();
    if (!original) throw new Error("Original Olympiad not found");

    const newSlug = `${original.slug}-copy-${Date.now().toString().slice(-4)}`;
    const newTitle = `${original.title} (Copy)`;

    const duplicated = await Olympiad.create({
      ...original,
      _id: undefined,
      title: newTitle,
      slug: newSlug,
      status: "Draft",
      createdBy: email,
      updatedBy: email,
      createdAt: undefined,
      updatedAt: undefined,
    });

    // Duplicate questions as well
    const questions = await OlympiadQuestion.find({ olympiadId: id }).lean();
    if (questions.length > 0) {
      const clonedQuestions = questions.map((q) => ({
        ...q,
        _id: undefined,
        olympiadId: duplicated._id,
        createdAt: undefined,
        updatedAt: undefined,
      }));
      await OlympiadQuestion.insertMany(clonedQuestions);
    }

    await logActivity(
      "CREATE",
      "Olympiad",
      `Duplicated Olympiad "${original.title}" to "${newTitle}"`,
    );

    revalidatePath("/dashboard/olympiads");
    return JSON.parse(JSON.stringify(duplicated));
  } catch (error) {
    handleError(error);
  }
}

export async function cancelOlympiad(id: string, reason: string) {
  try {
    const { email } = await verifyAdminAuth();
    await connectToDatabase();

    const olympiad = await Olympiad.findByIdAndUpdate(
      id,
      {
        status: "Cancelled",
        cancellationReason: reason,
        updatedBy: email,
      },
      { new: true },
    );

    await logActivity(
      "UPDATE",
      "Olympiad",
      `Cancelled Olympiad "${olympiad.title}". Reason: ${reason}`,
    );

    revalidatePath("/dashboard/olympiads");
    revalidatePath(`/olympiads/${olympiad.slug}`);
    return JSON.parse(JSON.stringify(olympiad));
  } catch (error) {
    handleError(error);
  }
}

export async function getOlympiadsAdmin(options?: {
  search?: string;
  status?: string;
  category?: string;
  page?: number;
  limit?: number;
}) {
  try {
    await verifyAdminAuth();
    await connectToDatabase();

    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (options?.status && options.status !== "all") {
      query.status = options.status;
    }
    if (options?.category && options.category !== "all") {
      query.category = options.category;
    }
    if (options?.search) {
      const regex = new RegExp(options.search, "i");
      query.$or = [{ title: regex }, { slug: regex }, { category: regex }];
    }

    const [items, totalCount] = await Promise.all([
      Olympiad.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<IOlympiad[]>(),
      Olympiad.countDocuments(query),
    ]);

    // Attach registration and attempt counts
    const olympiadIds = items.map((o) => o._id);
    const [regCounts, attemptCounts] = await Promise.all([
      OlympiadRegistration.aggregate([
        { $match: { olympiadId: { $in: olympiadIds }, status: "Confirmed" } },
        { $group: { _id: "$olympiadId", count: { $sum: 1 } } },
      ]),
      OlympiadAttempt.aggregate([
        { $match: { olympiadId: { $in: olympiadIds } } },
        { $group: { _id: "$olympiadId", count: { $sum: 1 } } },
      ]),
    ]);

    const regMap = Object.fromEntries(
      regCounts.map((r) => [String(r._id), r.count]),
    );
    const attemptMap = Object.fromEntries(
      attemptCounts.map((a) => [String(a._id), a.count]),
    );

    const enriched = items.map((item) => ({
      ...item,
      registrationCount: regMap[String(item._id)] || 0,
      attemptCount: attemptMap[String(item._id)] || 0,
      lifecycle: getOlympiadLifecycleState(item),
    }));

    return {
      olympiads: JSON.parse(JSON.stringify(enriched)),
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    };
  } catch (error) {
    handleError(error);
    return { olympiads: [], totalCount: 0, totalPages: 0, currentPage: 1 };
  }
}

export async function getOlympiadByIdAdmin(id: string) {
  try {
    await verifyAdminAuth();
    await connectToDatabase();

    const olympiad = await Olympiad.findById(id).lean<IOlympiad>();
    if (!olympiad) return null;

    const [questionCount, registrationCount, attemptCount] = await Promise.all([
      OlympiadQuestion.countDocuments({ olympiadId: id }),
      OlympiadRegistration.countDocuments({ olympiadId: id, status: "Confirmed" }),
      OlympiadAttempt.countDocuments({ olympiadId: id }),
    ]);

    return {
      ...JSON.parse(JSON.stringify(olympiad)),
      questionCount,
      registrationCount,
      attemptCount,
      lifecycle: getOlympiadLifecycleState(olympiad),
    };
  } catch (error) {
    handleError(error);
    return null;
  }
}

// -------------------- Public Actions --------------------

export async function getPublishedOlympiads() {
  try {
    await connectToDatabase();
    const items = await Olympiad.find({
      status: { $in: ["Published", "Archived"] },
    })
      .sort({ examStartDate: 1 })
      .lean<IOlympiad[]>();

    const enriched = items.map((item) => ({
      ...item,
      lifecycle: getOlympiadLifecycleState(item),
    }));

    return JSON.parse(JSON.stringify(enriched));
  } catch (error) {
    handleError(error);
    return [];
  }
}

export async function getOlympiadBySlugPublic(slug: string) {
  try {
    await connectToDatabase();
    const olympiad = await Olympiad.findOne({
      slug: slug.toLowerCase().trim(),
      status: { $in: ["Published", "Archived"] },
    }).lean<IOlympiad>();

    if (!olympiad) return null;

    const registrationCount = await OlympiadRegistration.countDocuments({
      olympiadId: olympiad._id,
      status: "Confirmed",
    });

    return {
      ...JSON.parse(JSON.stringify(olympiad)),
      registrationCount,
      lifecycle: getOlympiadLifecycleState(olympiad),
    };
  } catch (error) {
    handleError(error);
    return null;
  }
}
