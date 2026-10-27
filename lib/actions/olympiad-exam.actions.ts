"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/database";
import Olympiad, { IOlympiad } from "@/lib/database/models/olympiad.model";
import OlympiadRegistration, {
  IOlympiadRegistration,
} from "@/lib/database/models/olympiad-registration.model";
import OlympiadAttempt, {
  IOlympiadAttempt,
} from "@/lib/database/models/olympiad-attempt.model";
import OlympiadQuestion, {
  IOlympiadQuestion,
} from "@/lib/database/models/olympiad-question.model";
import { getOlympiadLifecycleState } from "@/lib/olympiad-lifecycle";
import { logActivity } from "@/lib/actions/activity-log.actions";
import { handleError } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { getUserEmailById } from "@/lib/actions/user.actions";
import { isAdmin } from "@/lib/actions/admin.actions";

// -------------------- Exam Access & Authoritative Timing --------------------

export async function startOrResumeExam({
  olympiadSlug,
  registrationIdentifier, // Can be email or registrationNumber
}: {
  olympiadSlug: string;
  registrationIdentifier: string;
}) {
  try {
    await connectToDatabase();
    const cleanId = registrationIdentifier.trim().toLowerCase();

    // 1. Fetch Olympiad
    const olympiad = await Olympiad.findOne({
      slug: olympiadSlug.toLowerCase().trim(),
      status: "Published",
    }).lean<IOlympiad>();

    if (!olympiad) {
      throw new Error("Olympiad not found or not published.");
    }

    const now = new Date();
    const lifecycle = getOlympiadLifecycleState(olympiad, now);

    if (!lifecycle.canEnterExam) {
      if (lifecycle.state === "scheduled" || lifecycle.state === "registration_open" || lifecycle.state === "registration_closed") {
        throw new Error(
          `The examination window has not started yet. Starts on: ${new Date(olympiad.examStartDate).toLocaleString()}`,
        );
      }
      throw new Error("The examination window for this Olympiad has closed.");
    }

    // 2. Validate Registration
    const registration = await OlympiadRegistration.findOne({
      olympiadId: olympiad._id,
      status: "Confirmed",
      $or: [
        { registrationNumber: cleanId.toUpperCase() },
        { email: cleanId },
      ],
    }).lean<IOlympiadRegistration>();

    if (!registration) {
      throw new Error(
        "No confirmed registration found for this email or registration number.",
      );
    }

    // 3. Check for existing attempt
    let attempt = await OlympiadAttempt.findOne({
      olympiadId: olympiad._id,
      registrationId: registration._id,
    });

    if (attempt) {
      if (attempt.status !== "in_progress") {
        return {
          status: attempt.status,
          message: "You have already completed and submitted your examination.",
          submittedAt: attempt.submittedAt,
          attemptId: String(attempt._id),
          isCompleted: true,
        };
      }

      // Align the attempt to the shared examination window so every
      // participant is dismissed at the same moment.
      const sharedDeadline = new Date(olympiad.examEndDate);
      if (
        new Date(attempt.effectiveDeadline).getTime() !==
        sharedDeadline.getTime()
      ) {
        attempt.effectiveDeadline = sharedDeadline;
        await attempt.save();
      }

      // Check if the shared window has expired
      if (now > sharedDeadline) {
        // Automatically finalize timed-out attempt
        await finalizeAttemptInternal(attempt._id.toString(), "timed_out");
        return {
          status: "timed_out",
          message: "Your examination time has expired.",
          attemptId: String(attempt._id),
          isCompleted: true,
        };
      }

      // Resume in-progress attempt
      return {
        success: true,
        isCompleted: false,
        attemptId: String(attempt._id),
        olympiadId: String(olympiad._id),
        olympiadTitle: olympiad.title,
        studentName: attempt.studentName,
        registrationNumber: registration.registrationNumber,
        startedAt: attempt.startedAt,
        effectiveDeadline: sharedDeadline,
        serverTime: now,
        durationMinutes: olympiad.durationMinutes,
        allowBackNavigation: olympiad.allowBackNavigation,
        allowReview: olympiad.allowReview,
        savedAnswers: attempt.answers || [],
      };
    }

    // 4. Create new Attempt bound to the shared authoritative window.
    // Every participant is admitted into one common examination window that
    // closes at examEndDate — late entrants simply have less time remaining.
    const effectiveDeadline = new Date(olympiad.examEndDate);

    attempt = await OlympiadAttempt.create({
      olympiadId: olympiad._id,
      registrationId: registration._id,
      studentEmail: registration.email,
      studentName: registration.studentName,
      studentInstitution: registration.institution,
      studentGrade: registration.grade,
      startedAt: now,
      effectiveDeadline,
      status: "in_progress",
      answers: [],
    });

    return {
      success: true,
      isCompleted: false,
      attemptId: String(attempt._id),
      olympiadId: String(olympiad._id),
      olympiadTitle: olympiad.title,
      studentName: attempt.studentName,
      registrationNumber: registration.registrationNumber,
      startedAt: attempt.startedAt,
      effectiveDeadline: attempt.effectiveDeadline,
      serverTime: now,
      durationMinutes: olympiad.durationMinutes,
      allowBackNavigation: olympiad.allowBackNavigation,
      allowReview: olympiad.allowReview,
      savedAnswers: [],
    };
  } catch (error) {
    handleError(error);
  }
}

// -------------------- Autosave Answer --------------------

export async function autosaveAnswer({
  attemptId,
  questionId,
  selectedOptions,
  textAnswer,
  isMarkedForReview,
}: {
  attemptId: string;
  questionId: string;
  selectedOptions?: string[];
  textAnswer?: string;
  isMarkedForReview?: boolean;
}) {
  try {
    await connectToDatabase();
    const attempt = await OlympiadAttempt.findById(attemptId);
    if (!attempt) throw new Error("Attempt not found");

    if (attempt.status !== "in_progress") {
      throw new Error("Cannot save: Attempt is already finalized.");
    }

    // Server-side timing check with 5-second network grace period
    const graceMs = 5000;
    if (Date.now() > new Date(attempt.effectiveDeadline).getTime() + graceMs) {
      await finalizeAttemptInternal(attemptId, "timed_out");
      throw new Error("Examination deadline has passed.");
    }

    const now = new Date();
    const answers = attempt.answers || [];
    const existingIndex = answers.findIndex(
      (a: any) => String(a.questionId) === questionId,
    );

    const answerPayload = {
      questionId,
      selectedOptions: selectedOptions || [],
      textAnswer: textAnswer || "",
      isMarkedForReview: Boolean(isMarkedForReview),
      savedAt: now,
    };

    if (existingIndex >= 0) {
      answers[existingIndex] = {
        ...answers[existingIndex],
        ...answerPayload,
      };
    } else {
      answers.push(answerPayload as any);
    }

    attempt.answers = answers;
    await attempt.save();

    return { success: true, savedAt: now };
  } catch (error) {
    handleError(error);
  }
}

// -------------------- Final Submit & Automated Evaluation --------------------

export async function submitExamAttempt(attemptId: string) {
  try {
    await connectToDatabase();
    return await finalizeAttemptInternal(attemptId, "submitted");
  } catch (error) {
    handleError(error);
  }
}

// -------------------- Proctoring / Anti-Cheat --------------------

/**
 * Records a blocked integrity violation (copy, print, screenshot shortcut,
 * context menu, dev-tools) without ending the session.
 */
export async function logProctoringViolation({
  attemptId,
  type,
  detail,
}: {
  attemptId: string;
  type: string;
  detail?: string;
}) {
  try {
    await connectToDatabase();

    const updated = await OlympiadAttempt.findOneAndUpdate(
      { _id: attemptId, status: "in_progress" },
      { $push: { "proctoring.violations": { type, detail, at: new Date() } } },
      { new: true },
    );

    if (!updated) {
      return { success: false, reason: "Attempt is no longer active." };
    }

    return {
      success: true,
      violationCount: updated.proctoring?.violations?.length ?? 0,
    };
  } catch (error) {
    handleError(error);
    return { success: false, reason: "Failed to record violation." };
  }
}

/**
 * Maximum-strictness enforcement: the first critical violation (leaving the
 * exam tab, window blur, exiting fullscreen, printing) immediately finalises
 * the attempt and flags it for administrative review.
 */
export async function terminateAttemptForViolation({
  attemptId,
  type,
  detail,
}: {
  attemptId: string;
  type: string;
  detail?: string;
}) {
  try {
    await connectToDatabase();

    const flagged = await OlympiadAttempt.findOneAndUpdate(
      { _id: attemptId, status: "in_progress" },
      {
        $push: { "proctoring.violations": { type, detail, at: new Date() } },
        $set: {
          "proctoring.terminated": true,
          "proctoring.terminationReason": detail || type,
        },
      },
      { new: true },
    );

    if (!flagged) {
      return { success: true, alreadyFinalized: true, terminated: true };
    }

    const result = await finalizeAttemptInternal(attemptId, "submitted");
    return { ...(result || {}), terminated: true };
  } catch (error) {
    handleError(error);
    return { success: false, terminated: true };
  }
}

async function finalizeAttemptInternal(
  attemptId: string,
  finalStatus: "submitted" | "timed_out",
) {
  const attempt = await OlympiadAttempt.findById(attemptId);
  if (!attempt) throw new Error("Attempt not found");

  if (attempt.status === "submitted" || attempt.status === "evaluated") {
    return {
      success: true,
      alreadySubmitted: true,
      attempt: JSON.parse(JSON.stringify(attempt)),
    };
  }

  const now = new Date();
  attempt.submittedAt = now;
  attempt.status = finalStatus;

  // Grade all objective questions
  const olympiad = await Olympiad.findById(attempt.olympiadId).lean<IOlympiad>();
  const questions = await OlympiadQuestion.find({
    olympiadId: attempt.olympiadId,
    isActive: true,
  }).lean<IOlympiadQuestion[]>();

  const negativePenalty = olympiad?.negativeMarking?.enabled
    ? olympiad.negativeMarking.penaltyPerQuestion || 0
    : 0;

  let totalScore = 0;
  let maxScore = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;
  let requiresManualGrading = false;

  const answerMap = new Map<string, any>();
  (attempt.answers || []).forEach((a: any) =>
    answerMap.set(String(a.questionId), a),
  );

  const gradedAnswers = questions.map((q) => {
    maxScore += q.marks;
    const studentAns = answerMap.get(String(q._id));

    if (!studentAns) {
      unansweredCount++;
      return {
        questionId: q._id,
        savedAt: now,
        marksAwarded: 0,
        isCorrect: false,
      };
    }

    // 1. Single Choice & True/False
    if (q.questionType === "single_choice" || q.questionType === "true_false") {
      const selected = studentAns.selectedOptions?.[0];
      if (!selected) {
        unansweredCount++;
        return {
          ...studentAns,
          marksAwarded: 0,
          isCorrect: false,
        };
      }

      const isCorrect = q.correctAnswers.includes(selected);
      if (isCorrect) {
        correctCount++;
        totalScore += q.marks;
        return {
          ...studentAns,
          marksAwarded: q.marks,
          isCorrect: true,
        };
      } else {
        incorrectCount++;
        totalScore -= negativePenalty;
        return {
          ...studentAns,
          marksAwarded: -negativePenalty,
          isCorrect: false,
        };
      }
    }

    // 2. Multiple Select (with partial credit support)
    if (q.questionType === "multiple_choice") {
      const selected = studentAns.selectedOptions || [];
      if (selected.length === 0) {
        unansweredCount++;
        return {
          ...studentAns,
          marksAwarded: 0,
          isCorrect: false,
        };
      }

      const correctSet = new Set(q.correctAnswers);
      let correctlySelected = 0;
      let incorrectlySelected = 0;

      selected.forEach((opt: string) => {
        if (correctSet.has(opt)) correctlySelected++;
        else incorrectlySelected++;
      });

      if (incorrectlySelected === 0 && correctlySelected === correctSet.size) {
        // Fully correct
        correctCount++;
        totalScore += q.marks;
        return {
          ...studentAns,
          marksAwarded: q.marks,
          isCorrect: true,
        };
      } else if (q.partialCredit && incorrectlySelected === 0 && correctlySelected > 0) {
        // Partial credit
        const partialMarks = Number(
          ((correctlySelected / correctSet.size) * q.marks).toFixed(2),
        );
        totalScore += partialMarks;
        return {
          ...studentAns,
          marksAwarded: partialMarks,
          isCorrect: false,
        };
      } else {
        incorrectCount++;
        totalScore -= negativePenalty;
        return {
          ...studentAns,
          marksAwarded: -negativePenalty,
          isCorrect: false,
        };
      }
    }

    // 3. Short Answer / Fill in the blank (normalized comparison)
    if (q.questionType === "short_answer" || q.questionType === "fill_in_the_blank") {
      const rawText = (studentAns.textAnswer || "").trim();
      if (!rawText) {
        unansweredCount++;
        return {
          ...studentAns,
          marksAwarded: 0,
          isCorrect: false,
        };
      }

      const studentNormalized = q.caseSensitive
        ? rawText
        : rawText.toLowerCase();

      const matched = q.correctAnswers.some((ans) => {
        const target = q.caseSensitive ? ans.trim() : ans.trim().toLowerCase();
        return studentNormalized === target;
      });

      if (matched) {
        correctCount++;
        totalScore += q.marks;
        return {
          ...studentAns,
          marksAwarded: q.marks,
          isCorrect: true,
        };
      } else {
        incorrectCount++;
        totalScore -= negativePenalty;
        return {
          ...studentAns,
          marksAwarded: -negativePenalty,
          isCorrect: false,
        };
      }
    }

    // 4. Descriptive / Essay question
    if (q.questionType === "descriptive") {
      requiresManualGrading = true;
      if (!studentAns.textAnswer?.trim()) {
        unansweredCount++;
        return {
          ...studentAns,
          marksAwarded: 0,
          isCorrect: false,
        };
      }
      return {
        ...studentAns,
        marksAwarded: 0, // Pending manual evaluation
        isCorrect: undefined,
      };
    }

    return studentAns;
  });

  // Clamp minimum total score at 0
  const finalScore = Math.max(0, Number(totalScore.toFixed(2)));
  const percentage = maxScore > 0 ? Number(((finalScore / maxScore) * 100).toFixed(2)) : 0;

  attempt.answers = gradedAnswers;
  attempt.totalScore = finalScore;
  attempt.maxScore = maxScore;
  attempt.percentage = percentage;
  attempt.correctCount = correctCount;
  attempt.incorrectCount = incorrectCount;
  attempt.unansweredCount = unansweredCount;
  attempt.requiresManualGrading = requiresManualGrading;
  attempt.manualGradingCompleted = !requiresManualGrading;

  if (!requiresManualGrading) {
    attempt.status = "evaluated";
  }

  await attempt.save();

  // Recalculate competition ranks
  await recalculateCompetitionRanks(olympiad!._id.toString());

  return {
    success: true,
    attempt: JSON.parse(JSON.stringify(attempt)),
  };
}

// -------------------- Manual Grading & Ranking Engine --------------------

export async function gradeDescriptiveAnswer({
  attemptId,
  questionId,
  marksAwarded,
  feedback,
}: {
  attemptId: string;
  questionId: string;
  marksAwarded: number;
  feedback?: string;
}) {
  try {
    const { sessionClaims } = await auth();
    const userId = sessionClaims?.userId as string;
    const adminEmail = await getUserEmailById(userId);
    if (!adminEmail || !(await isAdmin(adminEmail))) throw new Error("Forbidden");

    await connectToDatabase();
    const attempt = await OlympiadAttempt.findById(attemptId);
    if (!attempt) throw new Error("Attempt not found");

    const answers = attempt.answers || [];
    const ans = answers.find((a: any) => String(a.questionId) === questionId);
    if (!ans) throw new Error("Answer not found for question");

    const diff = marksAwarded - (ans.marksAwarded || 0);
    ans.marksAwarded = marksAwarded;
    ans.isCorrect = marksAwarded > 0;
    ans.manualFeedback = feedback;

    attempt.totalScore = Math.max(0, Number((attempt.totalScore + diff).toFixed(2)));
    attempt.percentage =
      attempt.maxScore > 0
        ? Number(((attempt.totalScore / attempt.maxScore) * 100).toFixed(2))
        : 0;

    // Check if all descriptive questions have been graded
    const pendingQuestions = await OlympiadQuestion.find({
      olympiadId: attempt.olympiadId,
      questionType: "descriptive",
      isActive: true,
    }).select("_id");

    const pendingIds = new Set(pendingQuestions.map((q) => String(q._id)));
    const allGraded = answers
      .filter((a: any) => pendingIds.has(String(a.questionId)))
      .every((a: any) => a.marksAwarded !== undefined);

    if (allGraded) {
      attempt.manualGradingCompleted = true;
      attempt.status = "evaluated";
      attempt.gradedBy = adminEmail;
      attempt.gradedAt = new Date();
    }

    await attempt.save();

    await logActivity(
      "UPDATE",
      "OlympiadAttempt",
      `Manually graded question for student "${attempt.studentName}". Awarded: ${marksAwarded} marks`,
    );

    // Recalculate ranks across Olympiad
    await recalculateCompetitionRanks(attempt.olympiadId.toString());

    revalidatePath(`/dashboard/olympiads/${attempt.olympiadId}`);
    return JSON.parse(JSON.stringify(attempt));
  } catch (error) {
    handleError(error);
  }
}

/**
 * Standard Competition Ranking (1, 2, 2, 4):
 * Ties broken by: 1) Score DESC, 2) Earlier submittedAt ASC
 */
export async function recalculateCompetitionRanks(olympiadId: string) {
  try {
    await connectToDatabase();

    const attempts = await OlympiadAttempt.find({
      olympiadId,
      status: { $in: ["submitted", "evaluated", "timed_out"] },
    })
      .sort({ totalScore: -1, submittedAt: 1 })
      .lean<IOlympiadAttempt[]>();

    if (attempts.length === 0) return;

    let currentRank = 1;
    const bulkOps = [];

    for (let i = 0; i < attempts.length; i++) {
      if (i > 0) {
        const prev = attempts[i - 1];
        const curr = attempts[i];
        // If equal score and same minute submission, share rank
        if (prev.totalScore === curr.totalScore) {
          // Keep currentRank same
        } else {
          currentRank = i + 1;
        }
      }

      bulkOps.push({
        updateOne: {
          filter: { _id: attempts[i]._id },
          update: { $set: { rank: currentRank } },
        },
      });
    }

    if (bulkOps.length > 0) {
      await OlympiadAttempt.bulkWrite(bulkOps);
    }
  } catch (error) {
    console.error("[Rank Recalculation Error]:", error);
  }
}

// -------------------- Public Leaderboard & Results --------------------

export async function getPublicLeaderboard(olympiadSlug: string) {
  try {
    await connectToDatabase();

    const olympiad = await Olympiad.findOne({
      slug: olympiadSlug.toLowerCase().trim(),
      status: { $in: ["Published", "Archived"] },
    }).lean<IOlympiad>();

    if (!olympiad) throw new Error("Olympiad not found.");

    const now = new Date();
    const lifecycle = getOlympiadLifecycleState(olympiad, now);

    if (!lifecycle.canViewResults) {
      return {
        isPublic: false,
        message: "Results for this Olympiad have not been published yet.",
        publishDate: olympiad.resultsPublishDate,
      };
    }

    const attempts = await OlympiadAttempt.find({
      olympiadId: olympiad._id,
      status: { $in: ["submitted", "evaluated"] },
    })
      .sort({ rank: 1, totalScore: -1 })
      .select("rank studentName studentInstitution studentGrade totalScore maxScore percentage submittedAt")
      .lean();

    return {
      isPublic: true,
      olympiadTitle: olympiad.title,
      slug: olympiad.slug,
      totalParticipants: attempts.length,
      leaderboard: JSON.parse(JSON.stringify(attempts)),
    };
  } catch (error) {
    handleError(error);
    return { isPublic: false, message: "Failed to fetch leaderboard" };
  }
}

export async function getOlympiadAttemptsAdmin(
  olympiadId: string,
  options?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  },
) {
  try {
    const { sessionClaims } = await auth();
    const userId = sessionClaims?.userId as string;
    const email = await getUserEmailById(userId);
    if (!email || !(await isAdmin(email))) throw new Error("Forbidden");

    await connectToDatabase();

    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const query: any = { olympiadId };
    if (options?.status && options.status !== "all") {
      query.status = options.status;
    }
    if (options?.search) {
      const regex = new RegExp(options.search, "i");
      query.$or = [{ studentName: regex }, { studentEmail: regex }];
    }

    const [attempts, totalCount] = await Promise.all([
      OlympiadAttempt.find(query)
        .sort({ totalScore: -1, submittedAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean<IOlympiadAttempt[]>(),
      OlympiadAttempt.countDocuments(query),
    ]);

    return {
      attempts: JSON.parse(JSON.stringify(attempts)),
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    };
  } catch (error) {
    handleError(error);
    return { attempts: [], totalCount: 0, totalPages: 0, currentPage: 1 };
  }
}
