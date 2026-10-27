import { IOlympiad } from "./database/models/olympiad.model";

export type OlympiadDerivedState =
  | "draft"
  | "cancelled"
  | "archived"
  | "scheduled"
  | "registration_open"
  | "registration_closed"
  | "exam_live"
  | "exam_ended"
  | "evaluation_pending"
  | "results_published";

export interface OlympiadStateInfo {
  state: OlympiadDerivedState;
  label: string;
  badgeVariant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
  canRegister: boolean;
  canEnterExam: boolean;
  canViewResults: boolean;
}

/**
 * Computes the authoritative derived lifecycle state of an Olympiad
 * based on current server time (UTC) and the Olympiad's configured schedule.
 */
export function getOlympiadLifecycleState(
  olympiad: Partial<IOlympiad>,
  now: Date = new Date(),
): OlympiadStateInfo {
  if (olympiad.status === "Draft") {
    return {
      state: "draft",
      label: "খসড়া (Draft)",
      badgeVariant: "outline",
      canRegister: false,
      canEnterExam: false,
      canViewResults: false,
    };
  }

  if (olympiad.status === "Cancelled") {
    return {
      state: "cancelled",
      label: "বাতিল (Cancelled)",
      badgeVariant: "destructive",
      canRegister: false,
      canEnterExam: false,
      canViewResults: false,
    };
  }

  if (olympiad.status === "Archived") {
    return {
      state: "archived",
      label: "সংরক্ষিত (Archived)",
      badgeVariant: "secondary",
      canRegister: false,
      canEnterExam: false,
      canViewResults: Boolean(olympiad.isResultsPublic),
    };
  }

  const nowMs = now.getTime();
  const regStartMs = olympiad.registrationStartDate
    ? new Date(olympiad.registrationStartDate).getTime()
    : 0;
  const regDeadlineMs = olympiad.registrationDeadline
    ? new Date(olympiad.registrationDeadline).getTime()
    : 0;
  const examStartMs = olympiad.examStartDate
    ? new Date(olympiad.examStartDate).getTime()
    : 0;
  const examEndMs = olympiad.examEndDate
    ? new Date(olympiad.examEndDate).getTime()
    : 0;
  const resultsPublishMs = olympiad.resultsPublishDate
    ? new Date(olympiad.resultsPublishDate).getTime()
    : 0;

  // 1. Before Registration Starts
  if (nowMs < regStartMs) {
    return {
      state: "scheduled",
      label: "নির্ধারিত (Upcoming)",
      badgeVariant: "secondary",
      canRegister: false,
      canEnterExam: false,
      canViewResults: false,
    };
  }

  // 2. Registration is Open
  if (nowMs >= regStartMs && nowMs < regDeadlineMs) {
    return {
      state: "registration_open",
      label: "নিবন্ধন চলছে (Reg. Open)",
      badgeVariant: "success",
      canRegister: true,
      canEnterExam: false,
      canViewResults: false,
    };
  }

  // 3. Registration Closed, Exam Pending
  if (nowMs >= regDeadlineMs && nowMs < examStartMs) {
    return {
      state: "registration_closed",
      label: "নিবন্ধন শেষ (Exam Soon)",
      badgeVariant: "warning",
      canRegister: false,
      canEnterExam: false,
      canViewResults: false,
    };
  }

  // 4. Examination Window is Live
  if (nowMs >= examStartMs && nowMs <= examEndMs) {
    return {
      state: "exam_live",
      label: "পরীক্ষা চলছে (Exam Live)",
      badgeVariant: "destructive",
      canRegister: false,
      canEnterExam: true,
      canViewResults: false,
    };
  }

  // 5. Results Published
  if (
    olympiad.isResultsPublic &&
    resultsPublishMs > 0 &&
    nowMs >= resultsPublishMs
  ) {
    return {
      state: "results_published",
      label: "ফলাফল প্রকাশিত (Results Out)",
      badgeVariant: "success",
      canRegister: false,
      canEnterExam: false,
      canViewResults: true,
    };
  }

  // 6. Exam Ended / Evaluation Pending
  return {
    state: "exam_ended",
    label: "পরীক্ষা সম্পন্ন (Exam Ended)",
    badgeVariant: "outline",
    canRegister: false,
    canEnterExam: false,
    canViewResults: false,
  };
}

/**
 * Format a Date for display in Asia/Dhaka (+06:00) timezone
 */
export function formatDhakaDateTime(
  dateInput: Date | string | null | undefined,
  includeTime: boolean = true,
): string {
  if (!dateInput) return "N/A";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "N/A";

  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "short",
    day: "numeric",
    ...(includeTime && {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
  };

  return new Intl.DateTimeFormat("en-US", options).format(date);
}
