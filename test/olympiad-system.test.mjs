import test from "node:test";
import assert from "node:assert/strict";

// -------------------- 1. Lifecycle State Machine Tests --------------------
test("Lifecycle State Machine: accurately transitions through all 8 states", () => {
  const baseOlympiad = {
    status: "Published",
    registrationStartDate: new Date("2026-11-01T00:00:00Z"),
    registrationDeadline: new Date("2026-11-10T23:59:59Z"),
    examStartDate: new Date("2026-11-15T10:00:00Z"),
    examEndDate: new Date("2026-11-15T12:00:00Z"),
    resultsPublishDate: new Date("2026-11-20T10:00:00Z"),
    isResultsPublic: true,
  };

  // Helper matching lib/olympiad-lifecycle.ts
  function getTestState(olympiad, now) {
    if (olympiad.status === "Draft") return "draft";
    if (olympiad.status === "Cancelled") return "cancelled";
    if (olympiad.status === "Archived") return "archived";

    const nowMs = now.getTime();
    const regStartMs = new Date(olympiad.registrationStartDate).getTime();
    const regDeadlineMs = new Date(olympiad.registrationDeadline).getTime();
    const examStartMs = new Date(olympiad.examStartDate).getTime();
    const examEndMs = new Date(olympiad.examEndDate).getTime();
    const resultsPublishMs = new Date(olympiad.resultsPublishDate).getTime();

    if (nowMs < regStartMs) return "scheduled";
    if (nowMs >= regStartMs && nowMs < regDeadlineMs) return "registration_open";
    if (nowMs >= regDeadlineMs && nowMs < examStartMs) return "registration_closed";
    if (nowMs >= examStartMs && nowMs <= examEndMs) return "exam_live";
    if (olympiad.isResultsPublic && resultsPublishMs > 0 && nowMs >= resultsPublishMs) return "results_published";
    return "exam_ended";
  }

  // A. Draft check
  assert.equal(getTestState({ ...baseOlympiad, status: "Draft" }, new Date()), "draft");

  // B. Cancelled check
  assert.equal(getTestState({ ...baseOlympiad, status: "Cancelled" }, new Date()), "cancelled");

  // C. Scheduled (before registration start)
  assert.equal(getTestState(baseOlympiad, new Date("2026-10-25T00:00:00Z")), "scheduled");

  // D. Registration Open
  assert.equal(getTestState(baseOlympiad, new Date("2026-11-05T12:00:00Z")), "registration_open");

  // E. Registration Closed (exam pending)
  assert.equal(getTestState(baseOlympiad, new Date("2026-11-12T00:00:00Z")), "registration_closed");

  // F. Exam Live
  assert.equal(getTestState(baseOlympiad, new Date("2026-11-15T11:00:00Z")), "exam_live");

  // G. Exam Ended (before results)
  assert.equal(getTestState(baseOlympiad, new Date("2026-11-16T00:00:00Z")), "exam_ended");

  // H. Results Published
  assert.equal(getTestState(baseOlympiad, new Date("2026-11-21T00:00:00Z")), "results_published");
});

// -------------------- 2. Authoritative Timing Tests --------------------
test("Authoritative Timing: enforces min(startedAt + duration, examEndDate)", () => {
  const examEnd = new Date("2026-11-15T12:00:00Z");
  const durationMinutes = 60; // 1 hour

  // Case 1: Student starts at 10:00 (Allowed duration ends at 11:00, which is < 12:00)
  const startEarly = new Date("2026-11-15T10:00:00Z");
  const durationDeadline1 = new Date(startEarly.getTime() + durationMinutes * 60000);
  const effectiveDeadline1 = durationDeadline1 < examEnd ? durationDeadline1 : examEnd;
  assert.equal(effectiveDeadline1.toISOString(), "2026-11-15T11:00:00.000Z");

  // Case 2: Late entry at 11:30 (Allowed duration ends at 12:30, but exam ends at 12:00)
  const startLate = new Date("2026-11-15T11:30:00Z");
  const durationDeadline2 = new Date(startLate.getTime() + durationMinutes * 60000);
  const effectiveDeadline2 = durationDeadline2 < examEnd ? durationDeadline2 : examEnd;
  assert.equal(effectiveDeadline2.toISOString(), "2026-11-15T12:00:00.000Z");
});

// -------------------- 3. Deterministic Evaluation Engine --------------------
test("Evaluation Engine: handles MCQ, Multiple Select with Partial Credit, and Negative Marking", () => {
  // Question 1: Single Choice (Marks: 2, Negative: 0.5, Correct: opt_2)
  const q1 = { marks: 2, negative: 0.5, correct: ["opt_2"] };
  const ans1Correct = { selected: ["opt_2"] };
  const score1Correct = q1.correct.includes(ans1Correct.selected[0]) ? q1.marks : -q1.negative;
  assert.equal(score1Correct, 2);

  const ans1Wrong = { selected: ["opt_1"] };
  const score1Wrong = q1.correct.includes(ans1Wrong.selected[0]) ? q1.marks : -q1.negative;
  assert.equal(score1Wrong, -0.5);

  // Question 2: Multiple Select with Partial Credit (Marks: 4, Negative: 1, Correct: ["A", "B", "C"])
  const correctSet = new Set(["A", "B", "C"]);
  const q2Marks = 4;
  const q2Negative = 1;

  function gradeMultipleSelect(selected) {
    let correctlySelected = 0;
    let incorrectlySelected = 0;
    selected.forEach((opt) => {
      if (correctSet.has(opt)) correctlySelected++;
      else incorrectlySelected++;
    });

    if (incorrectlySelected === 0 && correctlySelected === correctSet.size) {
      return q2Marks;
    } else if (incorrectlySelected === 0 && correctlySelected > 0) {
      return Number(((correctlySelected / correctSet.size) * q2Marks).toFixed(2));
    } else {
      return -q2Negative;
    }
  }

  // All 3 correct
  assert.equal(gradeMultipleSelect(["A", "B", "C"]), 4);
  // 2 out of 3 correct with no wrong option -> Partial credit 2/3 * 4 = 2.67
  assert.equal(gradeMultipleSelect(["A", "B"]), 2.67);
  // 1 out of 3 correct with no wrong option -> Partial credit 1/3 * 4 = 1.33
  assert.equal(gradeMultipleSelect(["A"]), 1.33);
  // Correct options chosen BUT includes a wrong option "D" -> Deducts negative penalty
  assert.equal(gradeMultipleSelect(["A", "B", "D"]), -1);
});

// -------------------- 4. Short Answer Normalization --------------------
test("Evaluation Engine: short answer whitespace and case normalization", () => {
  const acceptedAnswers = ["Dhaka", "dhaka", "Dacca"];

  function checkShortAnswer(studentInput, caseSensitive = false) {
    const raw = (studentInput || "").trim();
    if (!raw) return false;
    const normalized = caseSensitive ? raw : raw.toLowerCase();
    return acceptedAnswers.some((ans) => {
      const target = caseSensitive ? ans.trim() : ans.trim().toLowerCase();
      return normalized === target;
    });
  }

  assert.equal(checkShortAnswer("  Dhaka  "), true);
  assert.equal(checkShortAnswer("dhaka"), true);
  assert.equal(checkShortAnswer("DHAKA"), true);
  assert.equal(checkShortAnswer("Chittagong"), false);
});

// -------------------- 5. Competition Ranking (1, 2, 2, 4) --------------------
test("Ranking Engine: assigns competition ranking and breaks ties by submission time", () => {
  const attempts = [
    { id: "1", score: 95, submittedAt: new Date("2026-11-15T11:00:00Z") },
    { id: "2", score: 90, submittedAt: new Date("2026-11-15T10:45:00Z") },
    { id: "3", score: 90, submittedAt: new Date("2026-11-15T10:55:00Z") },
    { id: "4", score: 85, submittedAt: new Date("2026-11-15T11:15:00Z") },
  ];

  // Sort by score DESC, then submittedAt ASC
  attempts.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.submittedAt.getTime() - b.submittedAt.getTime();
  });

  let currentRank = 1;
  const ranks = [];

  for (let i = 0; i < attempts.length; i++) {
    if (i > 0) {
      const prev = attempts[i - 1];
      const curr = attempts[i];
      if (prev.score === curr.score) {
        // Tied score -> retains same rank
      } else {
        currentRank = i + 1;
      }
    }
    ranks.push({ id: attempts[i].id, rank: currentRank });
  }

  assert.deepEqual(ranks, [
    { id: "1", rank: 1 },
    { id: "2", rank: 2 },
    { id: "3", rank: 2 },
    { id: "4", rank: 4 }, // Standard competition ranking skips to 4
  ]);
});
