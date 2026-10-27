"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  startOrResumeExam,
  autosaveAnswer,
  submitExamAttempt,
  logProctoringViolation,
  terminateAttemptForViolation,
} from "@/lib/actions/olympiad-exam.actions";
import { getQuestionsForExamStudent } from "@/lib/actions/olympiad-question.actions";
import toast from "react-hot-toast";
import {
  Trophy,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Send,
  Save,
  HelpCircle,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Maximize,
  User,
  ArrowRight,
} from "lucide-react";

interface OlympiadExamEngineProps {
  olympiadSlug: string;
  themeColor?: string;
}

export default function OlympiadExamEngine({
  olympiadSlug,
  themeColor = "#0055CE",
}: OlympiadExamEngineProps) {
  // Step: "gate" | "exam" | "submitted"
  const [stage, setStage] = useState<"gate" | "exam" | "submitted">("gate");

  // Gate Inputs
  const [identifier, setIdentifier] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [gateError, setGateError] = useState("");

  // Exam Session
  const [sessionData, setSessionData] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Student Answers state: questionId -> { selectedOptions: string[], textAnswer: string, isMarkedForReview: boolean }
  const [answersState, setAnswersState] = useState<
    Record<
      string,
      {
        selectedOptions: string[];
        textAnswer: string;
        isMarkedForReview: boolean;
      }
    >
  >({});

  // Autosave status
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);

  // Authoritative countdown timer (in seconds)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [isSubmittingFinal, setIsSubmittingFinal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submittedAttempt, setSubmittedAttempt] = useState<any>(null);

  // Debounce ref for text answers
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ---- Proctoring / anti-cheat state ----
  const [supportsFullscreen, setSupportsFullscreen] = useState(false);
  const [fullscreenActive, setFullscreenActive] = useState(false);
  const [violationNotice, setViolationNotice] = useState("");
  const terminatedRef = useRef(false);
  const lastLoggedRef = useRef<Record<string, number>>({});

  useEffect(() => {
    setSupportsFullscreen(
      typeof document !== "undefined" &&
        typeof document.documentElement.requestFullscreen === "function",
    );
  }, []);

  // Ends the attempt immediately after a critical integrity violation.
  const terminateForViolation = useCallback(
    async (type: string, detail: string) => {
      const attemptId = sessionData?.attemptId;
      if (terminatedRef.current || !attemptId) return;
      terminatedRef.current = true;

      try {
        await terminateAttemptForViolation({ attemptId, type, detail });
      } catch {
        // Attempt is already finalised server-side.
      } finally {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
        setSubmittedAttempt({ status: "terminated", reason: detail });
        setStage("submitted");
        toast.error(detail);
      }
    },
    [sessionData?.attemptId],
  );

  // Enforce the examination integrity rules while the test is live.
  // Enforcement arms only once full-screen is active so the transition itself
  // cannot be mistaken for a violation.
  useEffect(() => {
    if (stage !== "exam") return;
    if (supportsFullscreen && !fullscreenActive) return;

    const logOnce = (type: string, detail: string) => {
      const now = Date.now();
      if (now - (lastLoggedRef.current[type] || 0) < 3000) return;
      lastLoggedRef.current[type] = now;
      const attemptId = sessionData?.attemptId;
      if (attemptId) {
        logProctoringViolation({ attemptId, type, detail }).catch(() => {});
      }
      setViolationNotice(detail);
      setTimeout(() => setViolationNotice(""), 4000);
    };

    const onBlocked = (type: string, detail: string) => (e: Event) => {
      e.preventDefault();
      logOnce(type, detail);
    };

    const onCopy = onBlocked(
      "copy_attempt",
      "Copying examination content is not allowed.",
    );
    const onCut = onBlocked(
      "copy_attempt",
      "Cutting examination content is not allowed.",
    );
    const onPaste = onBlocked(
      "paste_attempt",
      "Pasting content into the examination is not allowed.",
    );
    const onContextMenu = onBlocked(
      "context_menu",
      "Right-click is disabled during the examination.",
    );
    const onDragStart = onBlocked(
      "copy_attempt",
      "Dragging examination content is not allowed.",
    );

    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      const ctrl = e.ctrlKey || e.metaKey;

      if (key === "PrintScreen") {
        e.preventDefault();
        logOnce(
          "screenshot_attempt",
          "Screenshots are not allowed during the examination.",
        );
        return;
      }

      if (key === "F12" || (ctrl && e.shiftKey && ["i", "j", "c"].includes(key.toLowerCase()))) {
        e.preventDefault();
        logOnce("devtools_attempt", "Developer tools are not allowed.");
        return;
      }

      if (ctrl && ["c", "x", "v", "a", "s", "p", "u"].includes(key.toLowerCase())) {
        e.preventDefault();
        logOnce(
          "shortcut_blocked",
          `Keyboard shortcut Ctrl/Cmd+${key.toUpperCase()} is disabled.`,
        );
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        terminateForViolation(
          "tab_switch",
          "You switched away from the examination tab. Your exam has been submitted automatically.",
        );
      }
    };

    const onWindowBlur = () => {
      terminateForViolation(
        "window_blur",
        "You left the examination window. Your exam has been submitted automatically.",
      );
    };

    const onFullscreenChange = () => {
      const active = Boolean(document.fullscreenElement);
      setFullscreenActive(active);
      if (!active && supportsFullscreen) {
        terminateForViolation(
          "fullscreen_exit",
          "You exited full-screen mode. Your exam has been submitted automatically.",
        );
      }
    };

    const onBeforePrint = () => {
      terminateForViolation(
        "print_attempt",
        "Printing is not allowed during the examination.",
      );
    };

    document.addEventListener("copy", onCopy);
    document.addEventListener("cut", onCut);
    document.addEventListener("paste", onPaste);
    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("dragstart", onDragStart);
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("visibilitychange", onVisibilityChange);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    window.addEventListener("blur", onWindowBlur);
    window.addEventListener("beforeprint", onBeforePrint);

    return () => {
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("cut", onCut);
      document.removeEventListener("paste", onPaste);
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("dragstart", onDragStart);
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      window.removeEventListener("blur", onWindowBlur);
      window.removeEventListener("beforeprint", onBeforePrint);
    };
  }, [
    stage,
    sessionData?.attemptId,
    supportsFullscreen,
    fullscreenActive,
    terminateForViolation,
  ]);

  const enterFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setFullscreenActive(true);
    } catch {
      toast.error("Full-screen mode is required to continue the examination.");
    }
  };

  // 1. Enter Exam Gate
  const handleStartExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setIsVerifying(true);
    setGateError("");

    try {
      const res = await startOrResumeExam({
        olympiadSlug,
        registrationIdentifier: identifier.trim(),
      });

      if (!res) {
        throw new Error("Unable to start exam session.");
      }

      if (res.isCompleted) {
        setStage("submitted");
        setSubmittedAttempt({
          status: res.status,
          submittedAt: res.submittedAt,
        });
        return;
      }

      if (!res.olympiadId || !res.attemptId) {
        throw new Error("Invalid session details received from server.");
      }

      setSessionData(res);

      // Fetch sanitized question set
      const qList = await getQuestionsForExamStudent(
        res.olympiadId,
        res.attemptId,
      );
      setQuestions(qList);

      // Restore saved answers if resuming
      const initialMap: Record<string, any> = {};
      (res.savedAnswers || []).forEach((ans: any) => {
        initialMap[String(ans.questionId)] = {
          selectedOptions: ans.selectedOptions || [],
          textAnswer: ans.textAnswer || "",
          isMarkedForReview: Boolean(ans.isMarkedForReview),
        };
      });
      setAnswersState(initialMap);

      // Initialize authoritative timer
      const nowMs = Date.now();
      const deadlineMs = new Date(res.effectiveDeadline).getTime();
      const diffSec = Math.max(0, Math.floor((deadlineMs - nowMs) / 1000));
      setSecondsRemaining(diffSec);

      setStage("exam");
    } catch (err: any) {
      setGateError(err.message || "Failed to enter examination.");
    } finally {
      setIsVerifying(false);
    }
  };

  // 2. Countdown Timer Ticker
  useEffect(() => {
    if (stage !== "exam" || secondsRemaining <= 0) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit(true); // Auto-submit at deadline
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [stage, secondsRemaining]);

  // Format MM:SS or HH:MM:SS
  const formatTimer = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, "0")}:${String(
        seconds,
      ).padStart(2, "0")}`;
    }
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0",
    )}`;
  };

  // 3. Answer change & Autosave
  const triggerAutosave = useCallback(
    async (
      qId: string,
      selectedOptions?: string[],
      textAnswer?: string,
      isMarkedForReview?: boolean,
    ) => {
      if (!sessionData?.attemptId) return;
      setIsSaving(true);
      try {
        await autosaveAnswer({
          attemptId: sessionData.attemptId,
          questionId: qId,
          selectedOptions,
          textAnswer,
          isMarkedForReview,
        });
        setLastSavedTime(new Date());
      } catch (err: any) {
        console.error("Autosave error:", err);
      } finally {
        setIsSaving(false);
      }
    },
    [sessionData?.attemptId],
  );

  const handleOptionSelect = (qId: string, optId: string, isMulti: boolean) => {
    const current = answersState[qId] || {
      selectedOptions: [],
      textAnswer: "",
      isMarkedForReview: false,
    };

    let newSelected: string[] = [];
    if (isMulti) {
      if (current.selectedOptions.includes(optId)) {
        newSelected = current.selectedOptions.filter((id) => id !== optId);
      } else {
        newSelected = [...current.selectedOptions, optId];
      }
    } else {
      newSelected = [optId];
    }

    const updated = { ...current, selectedOptions: newSelected };
    setAnswersState((prev) => ({ ...prev, [qId]: updated }));
    triggerAutosave(qId, newSelected, current.textAnswer, current.isMarkedForReview);
  };

  const handleTextAnswerChange = (qId: string, text: string) => {
    const current = answersState[qId] || {
      selectedOptions: [],
      textAnswer: "",
      isMarkedForReview: false,
    };
    const updated = { ...current, textAnswer: text };
    setAnswersState((prev) => ({ ...prev, [qId]: updated }));

    // Debounce save for text inputs
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      triggerAutosave(
        qId,
        current.selectedOptions,
        text,
        current.isMarkedForReview,
      );
    }, 700);
  };

  const toggleMarkForReview = (qId: string) => {
    const current = answersState[qId] || {
      selectedOptions: [],
      textAnswer: "",
      isMarkedForReview: false,
    };
    const nextVal = !current.isMarkedForReview;
    const updated = { ...current, isMarkedForReview: nextVal };
    setAnswersState((prev) => ({ ...prev, [qId]: updated }));
    triggerAutosave(
      qId,
      current.selectedOptions,
      current.textAnswer,
      nextVal,
    );
  };

  // 4. Final Submission
  const handleFinalSubmit = async (isAutoTimeout = false) => {
    if (!sessionData?.attemptId || isSubmittingFinal) return;

    setIsSubmittingFinal(true);
    setShowConfirmModal(false);

    try {
      const res = await submitExamAttempt(sessionData.attemptId);
      if (res && res.success) {
        toast.success(
          isAutoTimeout
            ? "Time expired! Examination submitted automatically."
            : "Examination submitted successfully!",
        );
        // Normal completion: leave full-screen without tripping the proctoring guard.
        terminatedRef.current = true;
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
        setSubmittedAttempt(res.attempt);
        setStage("submitted");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to finalize examination.");
    } finally {
      setIsSubmittingFinal(false);
    }
  };

  // ==================== STAGE: GATE ====================
  if (stage === "gate") {
    return (
      <div className="max-w-md mx-auto my-12 bg-white p-8 rounded-3xl border border-gray-200 shadow-sm text-center space-y-6">
        <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto">
          <Trophy className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            Examination Portal
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Please enter your registered email address or Registration Number to
            access your live test session.
          </p>
        </div>

        {gateError && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 text-left flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{gateError}</span>
          </div>
        )}

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-left space-y-2">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wide">
            <ShieldAlert className="w-4 h-4" /> Examination Integrity Rules
          </div>
          <ul className="text-[11px] text-amber-900/90 space-y-1 list-disc pl-4">
            <li>
              All participants sit the <strong>same examination</strong> within
              one common window; the countdown is the shared remaining time.
            </li>
            <li>
              The test runs in <strong>full-screen</strong>. Leaving full-screen
              or switching tab/window submits your exam immediately.
            </li>
            <li>
              Copying, pasting, right-click, screenshot and print shortcuts are
              blocked and recorded for review.
            </li>
          </ul>
        </div>

        <form onSubmit={handleStartExam} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Email or Registration Number *
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="student@example.com or OLY-2026-XXXX"
                className="w-full pl-9 pr-3.5 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary focus:outline-none font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full py-3 rounded-xl text-white font-bold text-sm shadow-md transition hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ backgroundColor: themeColor }}
          >
            {isVerifying ? "Verifying..." : "Enter Examination"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-[11px] text-gray-400 border-t pt-3">
          This is a common examination window shared by all participants. The
          authoritative server timer counts down to the shared deadline and page
          refreshes will not reset it.
        </div>
      </div>
    );
  }

  // ==================== STAGE: SUBMITTED ====================
  if (stage === "submitted") {
    const isTerminated = submittedAttempt?.status === "terminated";

    return (
      <div className="max-w-xl mx-auto my-12 bg-white p-8 md:p-10 rounded-3xl border border-gray-200 shadow-sm text-center space-y-6">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
            isTerminated
              ? "bg-red-100 text-red-600"
              : "bg-green-100 text-green-600"
          }`}
        >
          {isTerminated ? (
            <ShieldAlert className="w-10 h-10" />
          ) : (
            <CheckCircle2 className="w-10 h-10" />
          )}
        </div>

        <div>
          <span
            className={`text-xs font-bold uppercase tracking-wider ${
              isTerminated ? "text-red-600" : "text-green-600"
            }`}
          >
            {isTerminated ? "Session Terminated" : "Session Completed"}
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-1">
            {isTerminated ? "Examination Ended" : "Examination Submitted!"}
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            {isTerminated
              ? submittedAttempt?.reason ||
                "Your examination session was ended because an integrity rule was violated. This session has been recorded for review."
              : "Your answers have been securely finalized and recorded on our evaluation servers."}
          </p>
        </div>

        {!isTerminated && submittedAttempt?.status === "evaluated" && (
          <div className="p-6 bg-blue-50/70 border border-blue-200 rounded-2xl text-left space-y-2">
            <div className="text-xs text-gray-500 font-semibold uppercase">
              Immediate Evaluation Result
            </div>
            <div className="text-3xl font-extrabold text-primary">
              {submittedAttempt.totalScore} / {submittedAttempt.maxScore}{" "}
              <span className="text-sm font-normal text-gray-600">
                ({submittedAttempt.percentage}%)
              </span>
            </div>
            <div className="text-xs text-gray-600 pt-1">
              Correct: {submittedAttempt.correctCount} • Incorrect:{" "}
              {submittedAttempt.incorrectCount} • Unanswered:{" "}
              {submittedAttempt.unansweredCount}
            </div>
          </div>
        )}

        <p className="text-xs text-gray-500">
          Official merit rankings and distinctions will be released according to
          the scheduled results publication date.
        </p>

        <div className="pt-2">
          <a
            href={`/olympiads/${olympiadSlug}`}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 text-sm transition"
          >
            Return to Olympiad Overview
          </a>
        </div>
      </div>
    );
  }

  // ==================== STAGE: ACTIVE EXAM ====================
  const currentQuestion = questions[currentIndex];
  const currentAns = currentQuestion
    ? answersState[String(currentQuestion._id)] || {
        selectedOptions: [],
        textAnswer: "",
        isMarkedForReview: false,
      }
    : null;

  const answeredCount = Object.values(answersState).filter(
    (a) => a.selectedOptions.length > 0 || a.textAnswer.trim() !== "",
  ).length;

  const isLowTime = secondsRemaining < 300; // less than 5 minutes

  return (
    <div className="max-w-6xl mx-auto my-4 space-y-4 px-2">
      {/* Integrity warning banner */}
      {violationNotice && (
        <div className="sticky top-2 z-40 flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-300 text-red-700 text-xs font-semibold shadow-sm">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          {violationNotice}
        </div>
      )}

      {/* Top Authoritative Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-2 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-sm md:text-base line-clamp-1">
              {sessionData?.olympiadTitle}
            </h1>
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <span>{sessionData?.studentName}</span>
              <span>• Reg: {sessionData?.registrationNumber}</span>
              <span className="text-green-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {isSaving ? "Saving..." : "Autosaved"}
              </span>
              <span className="text-primary font-medium flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Proctored
              </span>
            </div>
          </div>
        </div>

        {/* Live Authoritative Timer */}
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-base font-extrabold border ${
              isLowTime
                ? "bg-red-50 text-red-600 border-red-300 animate-pulse"
                : "bg-gray-100 text-gray-900 border-gray-200"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{formatTimer(secondsRemaining)}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            className="px-5 py-2 rounded-xl text-white text-xs font-bold bg-green-600 hover:bg-green-700 shadow-sm transition flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" /> Submit Exam
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left 3 Cols: Question Viewer */}
        <div className="lg:col-span-3 bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          {currentQuestion ? (
            <>
              {/* Question Header & Review Marker */}
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-primary text-white font-bold text-sm flex items-center justify-center">
                    Q{currentIndex + 1}
                  </span>
                  <span className="text-xs font-semibold uppercase text-gray-500 tracking-wider">
                    {currentQuestion.questionType.replace("_", " ")}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">
                    (Marks: +{currentQuestion.marks}
                    {currentQuestion.negativeMarks > 0 &&
                      `, Penalty: -${currentQuestion.negativeMarks}`}
                    )
                  </span>
                </div>

                {sessionData?.allowReview && (
                  <button
                    type="button"
                    onClick={() =>
                      toggleMarkForReview(String(currentQuestion._id))
                    }
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                      currentAns?.isMarkedForReview
                        ? "bg-amber-50 text-amber-700 border-amber-300"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    {currentAns?.isMarkedForReview
                      ? "Marked for Review"
                      : "Mark for Review"}
                  </button>
                )}
              </div>

              {/* Question Text */}
              <div className="text-base md:text-lg font-medium text-gray-900 leading-relaxed select-none">
                {currentQuestion.questionText}
              </div>

              {/* Optional Question Image */}
              {currentQuestion.image && (
                <div className="rounded-xl overflow-hidden border max-w-md mx-auto select-none">
                  <img
                    src={currentQuestion.image}
                    alt="Question Diagram"
                    draggable={false}
                    className="w-full object-contain"
                  />
                </div>
              )}

              {/* Options Input (Single Choice / Multiple Select / True False) */}
              {(currentQuestion.questionType === "single_choice" ||
                currentQuestion.questionType === "multiple_choice" ||
                currentQuestion.questionType === "true_false") && (
                <div className="space-y-3 pt-2">
                  {currentQuestion.options?.map((opt: any, optIdx: number) => {
                    const isSelected = currentAns?.selectedOptions.includes(
                      opt.id,
                    );
                    const isMulti =
                      currentQuestion.questionType === "multiple_choice";

                    return (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() =>
                          handleOptionSelect(
                            String(currentQuestion._id),
                            opt.id,
                            isMulti,
                          )
                        }
                        className={`w-full p-4 rounded-xl border text-left flex items-center gap-3 transition select-none ${
                          isSelected
                            ? "bg-primary/5 border-primary text-gray-900 shadow-sm"
                            : "bg-gray-50/40 border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border shrink-0 ${
                            isSelected
                              ? "bg-primary text-white border-primary"
                              : "border-gray-300 text-gray-500 bg-white"
                          }`}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="text-sm font-medium">{opt.text}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Short Answer / Fill in the blank Input */}
              {(currentQuestion.questionType === "short_answer" ||
                currentQuestion.questionType === "fill_in_the_blank") && (
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-bold text-gray-600">
                    Type your answer:
                  </label>
                  <input
                    type="text"
                    value={currentAns?.textAnswer || ""}
                    onChange={(e) =>
                      handleTextAnswerChange(
                        String(currentQuestion._id),
                        e.target.value,
                      )
                    }
                    placeholder="Enter your concise answer here..."
                    className="w-full p-3.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              )}

              {/* Descriptive Essay Input */}
              {currentQuestion.questionType === "descriptive" && (
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-bold text-gray-600">
                    Type your descriptive answer:
                  </label>
                  <textarea
                    rows={6}
                    value={currentAns?.textAnswer || ""}
                    onChange={(e) =>
                      handleTextAnswerChange(
                        String(currentQuestion._id),
                        e.target.value,
                      )
                    }
                    placeholder="Write your explanation or essay here..."
                    className="w-full p-3.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              )}

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-6 border-t">
                {sessionData?.allowBackNavigation ? (
                  <button
                    type="button"
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex((prev) => prev - 1)}
                    className="flex items-center gap-1.5 px-4 py-2 border rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>
                ) : (
                  <div />
                )}

                {currentIndex < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((prev) => prev + 1)}
                    className="flex items-center gap-1.5 px-6 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition hover:opacity-95"
                    style={{ backgroundColor: themeColor }}
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowConfirmModal(true)}
                    className="flex items-center gap-1.5 px-6 py-2 rounded-xl text-xs font-bold text-white bg-green-600 hover:bg-green-700 shadow-sm transition"
                  >
                    <Send className="w-4 h-4" /> Final Submit
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-400">
              No questions found.
            </div>
          )}
        </div>

        {/* Right 1 Col: Question Navigation Palette */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-700">
              Question Palette
            </h3>
            <span className="text-xs text-gray-500 font-semibold">
              {answeredCount}/{questions.length} Answered
            </span>
          </div>

          {/* Palette Indicators Legend */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-green-500" /> Answered
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-400" /> Review
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-gray-200" /> Unanswered
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded border-2 border-primary" />{" "}
              Current
            </div>
          </div>

          {/* Numbers Grid */}
          <div className="grid grid-cols-5 gap-2 pt-2">
            {questions.map((q, idx) => {
              const aState = answersState[String(q._id)];
              const isAnswered =
                aState &&
                (aState.selectedOptions?.length > 0 ||
                  aState.textAnswer?.trim() !== "");
              const isMarked = aState?.isMarkedForReview;
              const isCurrent = idx === currentIndex;

              let bgClass = "bg-gray-100 text-gray-700 hover:bg-gray-200";
              if (isMarked) {
                bgClass = "bg-amber-400 text-white font-bold";
              } else if (isAnswered) {
                bgClass = "bg-green-500 text-white font-bold";
              }

              return (
                <button
                  type="button"
                  key={q._id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-9 rounded-lg text-xs font-bold transition flex items-center justify-center relative ${bgClass} ${
                    isCurrent ? "ring-2 ring-primary ring-offset-1" : ""
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t">
            <button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              className="w-full py-2.5 rounded-xl text-white text-xs font-bold bg-green-600 hover:bg-green-700 shadow-sm transition"
            >
              Submit Examination
            </button>
          </div>
        </div>
      </div>

      {/* Mandatory full-screen gate */}
      {supportsFullscreen && !fullscreenActive && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl text-center space-y-5">
            <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Full-Screen Mode Required
              </h3>
              <p className="text-xs text-gray-600 mt-2">
                The examination is locked until full-screen mode is active.
                Exiting full-screen at any point will submit your exam
                immediately.
              </p>
            </div>
            <button
              type="button"
              onClick={enterFullscreen}
              className="w-full py-3 rounded-xl text-white font-bold text-sm shadow-md transition hover:opacity-95 flex items-center justify-center gap-2"
              style={{ backgroundColor: themeColor }}
            >
              <Maximize className="w-4 h-4" /> Enter Full-Screen &amp; Continue
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">
              Submit Examination?
            </h3>
            <p className="text-xs text-gray-600">
              Once submitted, you cannot change your answers. Here is your
              progress:
            </p>

            <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-xl text-xs">
              <div>
                Answered:{" "}
                <strong className="text-green-600">{answeredCount}</strong>
              </div>
              <div>
                Unanswered:{" "}
                <strong className="text-red-500">
                  {questions.length - answeredCount}
                </strong>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-gray-50"
              >
                Continue Exam
              </button>
              <button
                type="button"
                disabled={isSubmittingFinal}
                onClick={() => handleFinalSubmit(false)}
                className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold disabled:opacity-50"
              >
                {isSubmittingFinal
                  ? "Finalizing..."
                  : "Yes, Submit Final Answers"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
