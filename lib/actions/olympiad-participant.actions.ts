"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/database";
import OlympiadParticipant, {
  IOlympiadParticipant,
} from "@/lib/database/models/olympiad-participant.model";
import OlympiadRegistration, {
  IOlympiadRegistration,
} from "@/lib/database/models/olympiad-registration.model";
import Olympiad, { IOlympiad } from "@/lib/database/models/olympiad.model";
import { logActivity } from "@/lib/actions/activity-log.actions";
import { handleError } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { getUserEmailById } from "@/lib/actions/user.actions";
import { isAdmin } from "@/lib/actions/admin.actions";

async function verifyDirectoryAdmin(): Promise<string> {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;
  const email = await getUserEmailById(userId);
  if (!email || !(await isAdmin(email))) {
    throw new Error("Forbidden: Admin privileges required");
  }
  return email;
}

/**
 * Reserves (archives) every confirmed registration of an olympiad into the
 * standalone participant directory. The directory is keyed by email so a
 * person is stored once and simply accumulates the olympiads they appeared in.
 * This makes the details reusable even after the olympiad is deleted.
 */
export async function reserveRegistrationsToDirectory(olympiadId: string): Promise<{
  success: boolean;
  total: number;
  created: number;
  updated: number;
  error?: string;
}> {
  try {
    await verifyDirectoryAdmin();
    await connectToDatabase();

    const olympiad = await Olympiad.findById(olympiadId).lean<IOlympiad>();
    if (!olympiad) throw new Error("Olympiad not found");

    const registrations = await OlympiadRegistration.find({
      olympiadId,
      status: "Confirmed",
    }).lean<IOlympiadRegistration[]>();

    if (registrations.length === 0) {
      throw new Error("There are no confirmed registrations to reserve.");
    }

    const now = new Date();
    const ops = registrations.map((reg) => ({
      updateOne: {
        filter: { email: reg.email },
        update: {
          $set: {
            studentName: reg.studentName,
            phoneNumber: reg.phoneNumber,
            institution: reg.institution,
            grade: reg.grade,
            rollNumber: reg.rollNumber,
            district: reg.district,
            dateOfBirth: reg.dateOfBirth,
            guardianPhone: reg.guardianPhone,
            photo: reg.photo,
            lastSyncedAt: now,
          },
          // participatedAt is pinned to the original registration date so a
          // re-sync never inserts a duplicate source entry.
          $addToSet: {
            sources: {
              olympiadId: olympiad._id,
              olympiadTitle: olympiad.title,
              registrationNumber: reg.registrationNumber,
              participatedAt: reg.createdAt,
            },
          },
        },
        upsert: true,
      },
    }));

    const result = await OlympiadParticipant.bulkWrite(ops);

    await logActivity(
      "UPDATE",
      "OlympiadParticipant",
      `Reserved ${registrations.length} registration(s) from Olympiad "${olympiad.title}" into the participant directory`,
    );

    revalidatePath("/dashboard/participants");

    return {
      success: true,
      total: registrations.length,
      created: result.upsertedCount || 0,
      updated: result.modifiedCount || 0,
    };
  } catch (error: any) {
    handleError(error);
    return {
      success: false,
      total: 0,
      created: 0,
      updated: 0,
      error: error?.message || "Failed to reserve registrations.",
    };
  }
}

export async function getParticipantDirectory(options?: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  try {
    await verifyDirectoryAdmin();
    await connectToDatabase();

    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (options?.search) {
      const regex = new RegExp(options.search, "i");
      query.$or = [
        { studentName: regex },
        { email: regex },
        { phoneNumber: regex },
        { institution: regex },
        { rollNumber: regex },
      ];
    }

    const [participants, totalCount] = await Promise.all([
      OlympiadParticipant.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<IOlympiadParticipant[]>(),
      OlympiadParticipant.countDocuments(query),
    ]);

    return {
      participants: JSON.parse(JSON.stringify(participants)),
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    };
  } catch (error) {
    handleError(error);
    return {
      participants: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
    };
  }
}

export async function deleteParticipantFromDirectory(participantId: string) {
  try {
    await verifyDirectoryAdmin();
    await connectToDatabase();

    const participant = await OlympiadParticipant.findByIdAndDelete(participantId);
    if (!participant) throw new Error("Participant not found");

    await logActivity(
      "DELETE",
      "OlympiadParticipant",
      `Removed ${participant.studentName} (${participant.email}) from the participant directory`,
    );

    revalidatePath("/dashboard/participants");
    return { success: true };
  } catch (error) {
    handleError(error);
  }
}
