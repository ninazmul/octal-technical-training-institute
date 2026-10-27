"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/database";
import OlympiadQuestion, {
  IOlympiadQuestion,
  QuestionType,
  DifficultyLevel,
} from "@/lib/database/models/olympiad-question.model";
import Olympiad, { IOlympiad } from "@/lib/database/models/olympiad.model";
import OlympiadAttempt, {
  IOlympiadAttempt,
} from "@/lib/database/models/olympiad-attempt.model";
import { logActivity } from "@/lib/actions/activity-log.actions";
import { handleError } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { getUserEmailById } from "@/lib/actions/user.actions";
import { isAdmin } from "@/lib/actions/admin.actions";

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

export type QuestionInput = {
  olympiadId: string;
  questionText: string;
  questionType: QuestionType;
  image?: string;
  explanation?: string;
  marks: number;
  negativeMarks?: number;
  difficulty: DifficultyLevel;
  topic?: string;
  order?: number;
  options?: Array<{ id: string; text: string; image?: string }>;
  correctAnswers: string[];
  caseSensitive?: boolean;
  partialCredit?: boolean;
  gradingRubric?: string;
};

export async function createQuestion(data: QuestionInput) {
  try {
    await verifyAdminAuth();
    await connectToDatabase();

    const olympiad = await Olympiad.findById(data.olympiadId);
    if (!olympiad) throw new Error("Olympiad not found");

    // Compute next order if not supplied
    let order = data.order;
    if (order === undefined) {
      const highest = await OlympiadQuestion.findOne({
        olympiadId: data.olympiadId,
      })
        .sort({ order: -1 })
        .select("order");
      order = (highest?.order ?? 0) + 1;
    }

    const question = await OlympiadQuestion.create({
      ...data,
      order,
    });

    await logActivity(
      "CREATE",
      "OlympiadQuestion",
      `Added ${data.questionType} question for Olympiad "${olympiad.title}"`,
    );

    revalidatePath(`/dashboard/olympiads/${data.olympiadId}`);
    return JSON.parse(JSON.stringify(question));
  } catch (error) {
    handleError(error);
  }
}

export async function updateQuestion(
  questionId: string,
  data: Partial<QuestionInput>,
) {
  try {
    await verifyAdminAuth();
    await connectToDatabase();

    const question = await OlympiadQuestion.findByIdAndUpdate(
      questionId,
      data,
      { new: true, runValidators: true },
    );
    if (!question) throw new Error("Question not found");

    await logActivity(
      "UPDATE",
      "OlympiadQuestion",
      `Updated question ${questionId}`,
    );

    revalidatePath(`/dashboard/olympiads/${question.olympiadId}`);
    return JSON.parse(JSON.stringify(question));
  } catch (error) {
    handleError(error);
  }
}

export async function deleteQuestion(questionId: string) {
  try {
    await verifyAdminAuth();
    await connectToDatabase();

    const deleted = await OlympiadQuestion.findByIdAndDelete(questionId);
    if (!deleted) throw new Error("Question not found");

    await logActivity(
      "DELETE",
      "OlympiadQuestion",
      `Deleted question ${questionId}`,
    );

    revalidatePath(`/dashboard/olympiads/${deleted.olympiadId}`);
    return { success: true };
  } catch (error) {
    handleError(error);
  }
}

export async function getQuestionsForOlympiadAdmin(olympiadId: string) {
  try {
    await verifyAdminAuth();
    await connectToDatabase();

    const questions = await OlympiadQuestion.find({ olympiadId })
      .sort({ order: 1 })
      .lean();

    return JSON.parse(JSON.stringify(questions));
  } catch (error) {
    handleError(error);
    return [];
  }
}

export async function reorderQuestions(
  olympiadId: string,
  orderedIds: string[],
) {
  try {
    await verifyAdminAuth();
    await connectToDatabase();

    await Promise.all(
      orderedIds.map((id, index) =>
        OlympiadQuestion.findByIdAndUpdate(id, { order: index + 1 }),
      ),
    );

    revalidatePath(`/dashboard/olympiads/${olympiadId}`);
    return { success: true };
  } catch (error) {
    handleError(error);
  }
}

// -------------------- Secure Student Delivery --------------------

/**
 * Returns questions for an ongoing exam attempt.
 * CRITICAL SECURITY RULE: NEVER sends correctAnswers, explanation, or gradingRubric to the client!
 */
export async function getQuestionsForExamStudent(
  olympiadId: string,
  attemptId: string,
) {
  try {
    await connectToDatabase();

    const [olympiad, attempt] = await Promise.all([
      Olympiad.findById(olympiadId).lean<IOlympiad>(),
      OlympiadAttempt.findById(attemptId).lean<IOlympiadAttempt>(),
    ]);

    if (!olympiad || !attempt) {
      throw new Error("Invalid examination or attempt session.");
    }

    if (attempt.status !== "in_progress") {
      throw new Error("Examination attempt is already finalized.");
    }

    const allQuestions = await OlympiadQuestion.find({
      olympiadId,
      isActive: true,
    }).lean<IOlympiadQuestion[]>();

    if (allQuestions.length === 0) {
      throw new Error("No questions configured for this Olympiad.");
    }

    // Map questions by ID
    const questionMap = new Map<string, IOlympiadQuestion>();
    allQuestions.forEach((q) => questionMap.set(String(q._id), q));

    // Follow the attempt's assigned question order, or initialize it
    let orderedQuestions: IOlympiadQuestion[] = [];
    if (attempt.questionOrder && attempt.questionOrder.length > 0) {
      orderedQuestions = attempt.questionOrder
        .map((id) => questionMap.get(id))
        .filter(Boolean) as IOlympiadQuestion[];
    } else {
      orderedQuestions = [...allQuestions];
      if (olympiad.randomizeQuestions) {
        // Fisher-Yates shuffle
        for (let i = orderedQuestions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [orderedQuestions[i], orderedQuestions[j]] = [
            orderedQuestions[j],
            orderedQuestions[i],
          ];
        }
      }
      // Save randomized question sequence to attempt snapshot
      const orderedIds = orderedQuestions.map((q) => String(q._id));
      await OlympiadAttempt.findByIdAndUpdate(attemptId, {
        questionOrder: orderedIds,
      });
    }

    // Strip answers and optionally randomize options
    const sanitizedQuestions = orderedQuestions.map((q) => {
      let options = q.options ? [...q.options] : [];
      if (olympiad.randomizeOptions && options.length > 1) {
        for (let i = options.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [options[i], options[j]] = [options[j], options[i]];
        }
      }

      return {
        _id: String(q._id),
        questionText: q.questionText,
        questionType: q.questionType,
        image: q.image,
        marks: q.marks,
        negativeMarks: q.negativeMarks,
        difficulty: q.difficulty,
        topic: q.topic,
        options,
        // correctAnswers, explanation, and gradingRubric are strictly omitted!
      };
    });

    return sanitizedQuestions;
  } catch (error) {
    handleError(error);
    return [];
  }
}
