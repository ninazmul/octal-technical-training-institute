"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import QuestionBuilder from "./QuestionBuilder";
import {
  gradeDescriptiveAnswer,
  recalculateCompetitionRanks,
} from "@/lib/actions/olympiad-exam.actions";
import {
  updateOlympiad,
} from "@/lib/actions/olympiad.actions";
import { cancelRegistrationAdmin } from "@/lib/actions/olympiad-registration.actions";
import { formatDhakaDateTime } from "@/lib/olympiad-lifecycle";
import { exportRowsToCsv } from "@/lib/export.client";
import toast from "react-hot-toast";
import Link from "next/link";
import {
  Trophy,
  BookOpen,
  Users,
  CheckCircle,
  Clock,
  ArrowLeft,
  Download,
  Search,
  Award,
  Settings,
  RefreshCw,
  ExternalLink,
  Edit,
} from "lucide-react";

interface OlympiadHubProps {
  olympiad: any;
  questions: any[];
  registrations: any[];
  attempts: any[];
}

export default function OlympiadHub({
  olympiad,
  questions,
  registrations,
  attempts,
}: OlympiadHubProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "questions" | "registrations" | "attempts" | "evaluation" | "leaderboard"
  >("questions");

  // Registration Filter & Search
  const [regSearch, setRegSearch] = useState("");
  const [regGradeFilter, setRegGradeFilter] = useState("all");

  // Manual Grading State
  const [evaluatingAttemptId, setEvaluatingAttemptId] = useState<string | null>(
    null,
  );
  const [evaluatingQuestionId, setEvaluatingQuestionId] = useState<
    string | null
  >(null);
  const [awardedMarks, setAwardedMarks] = useState<number>(0);
  const [evalFeedback, setEvalFeedback] = useState("");
  const [isGrading, setIsGrading] = useState(false);

  // Results Publishing Toggle
  const [isPublishing, setIsPublishing] = useState(false);

  // Filtered registrations
  const filteredRegistrations = registrations.filter((r) => {
    const matchesSearch =
      !regSearch ||
      r.studentName?.toLowerCase().includes(regSearch.toLowerCase()) ||
      r.email?.toLowerCase().includes(regSearch.toLowerCase()) ||
      r.registrationNumber?.toLowerCase().includes(regSearch.toLowerCase()) ||
      r.institution?.toLowerCase().includes(regSearch.toLowerCase());

    const matchesGrade =
      regGradeFilter === "all" || r.grade === regGradeFilter;

    return matchesSearch && matchesGrade;
  });

  // Descriptive answers pending evaluation
  const pendingEvaluationAttempts = attempts.filter(
    (a) => a.requiresManualGrading && !a.manualGradingCompleted,
  );

  const handleExportRegistrations = () => {
    exportRowsToCsv(
      filteredRegistrations,
      [
        { header: "Reg Number", value: (r) => r.registrationNumber },
        { header: "Student Name", value: (r) => r.studentName },
        { header: "Email", value: (r) => r.email },
        { header: "Phone Number", value: (r) => r.phoneNumber },
        { header: "Institution", value: (r) => r.institution },
        { header: "Grade / Class", value: (r) => r.grade },
        { header: "Roll Number", value: (r) => r.rollNumber },
        { header: "District", value: (r) => r.district || "N/A" },
        { header: "Status", value: (r) => r.status },
        {
          header: "Registered At",
          value: (r) => formatDhakaDateTime(r.createdAt),
        },
      ],
      `${olympiad.slug}-registrations.csv`,
    );
  };

  const handleExportResults = () => {
    exportRowsToCsv(
      attempts,
      [
        { header: "Rank", value: (a) => a.rank || "N/A" },
        { header: "Student Name", value: (a) => a.studentName },
        { header: "Email", value: (a) => a.studentEmail },
        { header: "Institution", value: (a) => a.studentInstitution || "N/A" },
        { header: "Grade", value: (a) => a.studentGrade || "N/A" },
        { header: "Total Score", value: (a) => a.totalScore },
        { header: "Max Score", value: (a) => a.maxScore },
        { header: "Percentage", value: (a) => `${a.percentage}%` },
        { header: "Correct Count", value: (a) => a.correctCount },
        { header: "Incorrect Count", value: (a) => a.incorrectCount },
        { header: "Status", value: (a) => a.status },
        {
          header: "Submitted At",
          value: (a) => formatDhakaDateTime(a.submittedAt),
        },
      ],
      `${olympiad.slug}-leaderboard.csv`,
    );
  };

  const handleCancelReg = async (regId: string) => {
    if (!confirm("Are you sure you want to cancel this registration?")) return;
    try {
      await cancelRegistrationAdmin(regId);
      toast.success("Registration cancelled.");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel registration.");
    }
  };

  const handleRecalculateRanks = async () => {
    try {
      await recalculateCompetitionRanks(olympiad._id);
      toast.success("Leaderboard rankings recalculated successfully!");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to recalculate ranks.");
    }
  };

  const handleTogglePublishResults = async () => {
    setIsPublishing(true);
    try {
      const nextPublic = !olympiad.isResultsPublic;
      await updateOlympiad(olympiad._id, {
        isResultsPublic: nextPublic,
        resultsPublishDate: new Date().toISOString(),
      });
      toast.success(
        nextPublic
          ? "Results and Leaderboard are now PUBLIC!"
          : "Results have been hidden from public view.",
      );
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle result status.");
    } finally {
      setIsPublishing(false);
    }
  };

  const submitManualGrade = async () => {
    if (!evaluatingAttemptId || !evaluatingQuestionId) return;
    setIsGrading(true);
    try {
      await gradeDescriptiveAnswer({
        attemptId: evaluatingAttemptId,
        questionId: evaluatingQuestionId,
        marksAwarded: Number(awardedMarks),
        feedback: evalFeedback.trim(),
      });
      toast.success("Grade and feedback saved!");
      setEvaluatingAttemptId(null);
      setEvaluatingQuestionId(null);
      setAwardedMarks(0);
      setEvalFeedback("");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to save grade.");
    } finally {
      setIsGrading(false);
    }
  };

  const lifecycle = olympiad.lifecycle;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/olympiads"
            className="p-2 border rounded-lg hover:bg-gray-100 transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">
                {olympiad.title}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-primary/10 text-primary border-primary/20">
                {lifecycle?.label || olympiad.status}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
              <span>Category: {olympiad.category}</span>
              <span>• Duration: {olympiad.durationMinutes} mins</span>
              <span>• Total Marks: {olympiad.totalMarks}</span>
              <span>
                • Exam: {formatDhakaDateTime(olympiad.examStartDate)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/olympiads/${olympiad._id}/update`}
            className="border border-gray-300 text-gray-700 px-3.5 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-1.5 transition"
          >
            <Edit className="w-4 h-4" /> Edit Config
          </Link>
          <Link
            href={`/olympiads/${olympiad.slug}`}
            target="_blank"
            className="bg-primary text-white px-3.5 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 flex items-center gap-1.5 transition"
          >
            <ExternalLink className="w-4 h-4" /> Public Page
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-xs font-medium text-gray-500">
            Registered Students
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {registrations.length}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">
            Capacity:{" "}
            {olympiad.maxCapacity > 0 ? olympiad.maxCapacity : "Unlimited"}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-xs font-medium text-gray-500">
            Exam Submissions
          </div>
          <div className="text-2xl font-bold text-primary mt-1">
            {attempts.length}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">
            Attendance:{" "}
            {registrations.length > 0
              ? `${Math.round((attempts.length / registrations.length) * 100)}%`
              : "0%"}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-xs font-medium text-gray-500">
            Questions Bank
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {questions.length}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">
            Marks:{" "}
            {questions.reduce((acc, q) => acc + (q.marks || 0), 0)} /{" "}
            {olympiad.totalMarks}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-xs font-medium text-gray-500">
            Manual Grading Pending
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-1">
            {pendingEvaluationAttempts.length}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">Descriptive papers</div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200 gap-1 bg-white px-4 rounded-t-xl overflow-x-auto">
        <button
          onClick={() => setActiveTab("questions")}
          className={`py-3.5 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === "questions"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <BookOpen className="w-4 h-4" /> Questions ({questions.length})
        </button>

        <button
          onClick={() => setActiveTab("registrations")}
          className={`py-3.5 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === "registrations"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Users className="w-4 h-4" /> Registrations ({registrations.length})
        </button>

        <button
          onClick={() => setActiveTab("attempts")}
          className={`py-3.5 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === "attempts"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <CheckCircle className="w-4 h-4" /> Submissions ({attempts.length})
        </button>

        <button
          onClick={() => setActiveTab("evaluation")}
          className={`py-3.5 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === "evaluation"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Award className="w-4 h-4" /> Manual Evaluation (
          {pendingEvaluationAttempts.length})
        </button>

        <button
          onClick={() => setActiveTab("leaderboard")}
          className={`py-3.5 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === "leaderboard"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Trophy className="w-4 h-4" /> Leaderboard & Results
        </button>
      </div>

      {/* Tab 1: Questions */}
      {activeTab === "questions" && (
        <QuestionBuilder
          olympiadId={olympiad._id}
          olympiadTitle={olympiad.title}
          initialQuestions={questions}
        />
      )}

      {/* Tab 2: Registrations */}
      {activeTab === "registrations" && (
        <div className="bg-white p-6 rounded-b-xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search participant, roll, email..."
                value={regSearch}
                onChange={(e) => setRegSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <select
                value={regGradeFilter}
                onChange={(e) => setRegGradeFilter(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm bg-white"
              >
                <option value="all">All Classes</option>
                {olympiad.targetClasses?.map((cls: string) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>

              <button
                onClick={handleExportRegistrations}
                className="border border-gray-300 text-gray-700 px-3.5 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-1.5 transition"
              >
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b text-gray-600 text-xs uppercase font-medium">
                <tr>
                  <th className="py-3 px-4">Reg No</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Institution & Class</th>
                  <th className="py-3 px-4">Registered Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400">
                      No registrations found.
                    </td>
                  </tr>
                ) : (
                  filteredRegistrations.map((reg) => (
                    <tr key={reg._id} className="hover:bg-gray-50/50">
                      <td className="py-3 px-4 font-mono font-semibold text-primary text-xs">
                        {reg.registrationNumber}
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {reg.studentName}
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-600">
                        <div>{reg.email}</div>
                        <div className="text-gray-400">{reg.phoneNumber}</div>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-600">
                        <div className="font-medium text-gray-800">
                          {reg.institution}
                        </div>
                        <div>
                          Class: {reg.grade} • Roll: {reg.rollNumber}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-500">
                        {formatDhakaDateTime(reg.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {reg.status === "Confirmed" && (
                          <button
                            onClick={() => handleCancelReg(reg._id)}
                            className="text-xs text-red-500 hover:text-red-700 hover:underline"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Attempts & Submissions */}
      {activeTab === "attempts" && (
        <div className="bg-white p-6 rounded-b-xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-900">
              Examination Attempts & Submissions
            </h3>
            <button
              onClick={handleExportResults}
              className="border border-gray-300 text-gray-700 px-3.5 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50 flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" /> Export Results
            </button>
          </div>

          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b text-gray-600 text-xs uppercase font-medium">
                <tr>
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Accuracy</th>
                  <th className="py-3 px-4">Timing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attempts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400">
                      No attempts recorded yet.
                    </td>
                  </tr>
                ) : (
                  attempts.map((att) => (
                    <tr key={att._id} className="hover:bg-gray-50/50">
                      <td className="py-3 px-4 font-bold text-primary">
                        {att.rank ? `#${att.rank}` : "-"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">
                          {att.studentName}
                        </div>
                        <div className="text-xs text-gray-400">
                          {att.studentEmail}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="capitalize px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                          {att.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-900">
                        {att.totalScore} / {att.maxScore}{" "}
                        <span className="text-xs text-gray-400 font-normal">
                          ({att.percentage}%)
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-600">
                        <span className="text-green-600">
                          {att.correctCount} correct
                        </span>{" "}
                        •{" "}
                        <span className="text-red-500">
                          {att.incorrectCount} wrong
                        </span>{" "}
                        • {att.unansweredCount} skipped
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-500">
                        Submitted:{" "}
                        {att.submittedAt
                          ? formatDhakaDateTime(att.submittedAt)
                          : "In Progress"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Manual Evaluation */}
      {activeTab === "evaluation" && (
        <div className="bg-white p-6 rounded-b-xl border border-gray-200 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-gray-900">
              Manual Descriptive Question Grading
            </h3>
            <p className="text-xs text-gray-500">
              Score student essays and descriptive responses against the
              configured question rubric.
            </p>
          </div>

          {pendingEvaluationAttempts.length === 0 ? (
            <div className="p-8 text-center border rounded-lg bg-gray-50">
              <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-700">
                All submissions fully evaluated!
              </h4>
              <p className="text-xs text-gray-400 mt-1">
                There are no pending descriptive questions awaiting examiner
                review.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingEvaluationAttempts.map((attempt) => {
                // Find descriptive questions in this attempt
                const descriptiveQuestions = questions.filter(
                  (q) => q.questionType === "descriptive",
                );

                return (
                  <div
                    key={attempt._id}
                    className="p-5 border rounded-xl bg-gray-50/50 space-y-4"
                  >
                    <div className="flex items-center justify-between border-b pb-2">
                      <div>
                        <div className="font-bold text-gray-900">
                          {attempt.studentName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {attempt.studentEmail} • Institution:{" "}
                          {attempt.studentInstitution}
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-800 text-xs font-semibold">
                        Pending Evaluation
                      </span>
                    </div>

                    {descriptiveQuestions.map((dq) => {
                      const studentAnswer = attempt.answers?.find(
                        (a: any) => String(a.questionId) === String(dq._id),
                      );

                      const isCurrentlyEditing =
                        evaluatingAttemptId === attempt._id &&
                        evaluatingQuestionId === dq._id;

                      return (
                        <div
                          key={dq._id}
                          className="bg-white p-4 rounded-lg border space-y-3"
                        >
                          <div className="font-medium text-sm text-gray-900">
                            <strong>Question:</strong> {dq.questionText} (Max
                            Marks: {dq.marks})
                          </div>

                          {dq.gradingRubric && (
                            <div className="text-xs bg-amber-50 p-2.5 rounded text-amber-800">
                              <strong>Rubric:</strong> {dq.gradingRubric}
                            </div>
                          )}

                          <div className="p-3 bg-gray-50 rounded border text-sm text-gray-800">
                            <span className="font-semibold text-xs text-gray-500 block mb-1">
                              Student Answer:
                            </span>
                            {studentAnswer?.textAnswer || (
                              <em className="text-gray-400">
                                Question left unanswered
                              </em>
                            )}
                          </div>

                          {isCurrentlyEditing ? (
                            <div className="p-3 border rounded-lg bg-blue-50/40 space-y-2">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Marks Awarded (Max: {dq.marks})
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    max={dq.marks}
                                    step="0.5"
                                    value={awardedMarks}
                                    onChange={(e) =>
                                      setAwardedMarks(Number(e.target.value))
                                    }
                                    className="w-full border rounded p-1.5 text-xs bg-white"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Examiner Feedback
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Constructive feedback..."
                                    value={evalFeedback}
                                    onChange={(e) =>
                                      setEvalFeedback(e.target.value)
                                    }
                                    className="w-full border rounded p-1.5 text-xs bg-white"
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end gap-2 pt-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEvaluatingAttemptId(null);
                                    setEvaluatingQuestionId(null);
                                  }}
                                  className="px-3 py-1 border rounded text-xs"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  disabled={isGrading}
                                  onClick={submitManualGrade}
                                  className="px-4 py-1 bg-primary text-white rounded text-xs font-semibold disabled:opacity-50"
                                >
                                  {isGrading ? "Saving..." : "Submit Grade"}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-between items-center pt-1">
                              <span className="text-xs text-gray-500">
                                Awarded:{" "}
                                <strong>
                                  {studentAnswer?.marksAwarded ?? "Not Graded"}
                                </strong>{" "}
                                / {dq.marks}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setEvaluatingAttemptId(attempt._id);
                                  setEvaluatingQuestionId(dq._id);
                                  setAwardedMarks(
                                    studentAnswer?.marksAwarded || 0,
                                  );
                                  setEvalFeedback(
                                    studentAnswer?.manualFeedback || "",
                                  );
                                }}
                                className="px-3 py-1 bg-primary text-white rounded text-xs font-medium hover:bg-primary/90"
                              >
                                Grade Question
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Leaderboard & Results */}
      {activeTab === "leaderboard" && (
        <div className="bg-white p-6 rounded-b-xl border border-gray-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" /> Official Competition
                Leaderboard
              </h3>
              <p className="text-xs text-gray-500">
                Rankings calculated deterministically by Total Score (DESC) and
                earliest submission timestamp.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleRecalculateRanks}
                className="border border-gray-300 text-gray-700 px-3.5 py-2 rounded-lg text-xs font-medium hover:bg-gray-50 flex items-center gap-1.5 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Recalculate Ranks
              </button>

              <button
                type="button"
                disabled={isPublishing}
                onClick={handleTogglePublishResults}
                className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  olympiad.isResultsPublic
                    ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {olympiad.isResultsPublic
                  ? "Unpublish Results"
                  : "Publish Results Publicly"}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b text-gray-600 text-xs uppercase font-medium">
                <tr>
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Institution</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Percentage</th>
                  <th className="py-3 px-4">Submission Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attempts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-400">
                      No ranked participants available yet.
                    </td>
                  </tr>
                ) : (
                  attempts
                    .filter((a) => a.rank)
                    .sort((a, b) => (a.rank || 999) - (b.rank || 999))
                    .map((att) => (
                      <tr key={att._id} className="hover:bg-gray-50/50">
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                              att.rank === 1
                                ? "bg-amber-100 text-amber-800 border border-amber-300"
                                : att.rank === 2
                                ? "bg-slate-100 text-slate-800 border border-slate-300"
                                : att.rank === 3
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "text-gray-600"
                            }`}
                          >
                            {att.rank}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-gray-900">
                          {att.studentName}
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-600">
                          {att.studentInstitution || "N/A"}
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-600">
                          {att.studentGrade || "N/A"}
                        </td>
                        <td className="py-3 px-4 font-bold text-primary">
                          {att.totalScore} / {att.maxScore}
                        </td>
                        <td className="py-3 px-4 text-xs font-medium text-gray-700">
                          {att.percentage}%
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-400">
                          {formatDhakaDateTime(att.submittedAt)}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
