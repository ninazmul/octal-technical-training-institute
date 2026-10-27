"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createQuestion,
  updateQuestion,
  deleteQuestion,
  QuestionInput,
} from "@/lib/actions/olympiad-question.actions";
import { QuestionType, DifficultyLevel } from "@/lib/database/models/olympiad-question.model";
import toast from "react-hot-toast";
import {
  HelpCircle,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  BookOpen,
  Award,
} from "lucide-react";

interface QuestionBuilderProps {
  olympiadId: string;
  olympiadTitle: string;
  initialQuestions: any[];
}

export default function QuestionBuilder({
  olympiadId,
  olympiadTitle,
  initialQuestions,
}: QuestionBuilderProps) {
  const router = useRouter();
  const [questions, setQuestions] = useState(initialQuestions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState<QuestionType>("single_choice");
  const [image, setImage] = useState("");
  const [explanation, setExplanation] = useState("");
  const [marks, setMarks] = useState(1);
  const [negativeMarks, setNegativeMarks] = useState(0);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("Medium");
  const [topic, setTopic] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [partialCredit, setPartialCredit] = useState(false);
  const [gradingRubric, setGradingRubric] = useState("");

  // Options for MCQ / Multiple select / True-False
  const [options, setOptions] = useState<Array<{ id: string; text: string }>>([
    { id: "opt_1", text: "" },
    { id: "opt_2", text: "" },
    { id: "opt_3", text: "" },
    { id: "opt_4", text: "" },
  ]);

  // Selected correct answers (Option IDs for MCQ/TF, or accepted strings for Short Answer)
  const [correctAnswers, setCorrectAnswers] = useState<string[]>([]);
  const [shortAnswerInput, setShortAnswerInput] = useState("");

  const resetForm = () => {
    setEditingQuestionId(null);
    setQuestionText("");
    setQuestionType("single_choice");
    setImage("");
    setExplanation("");
    setMarks(1);
    setNegativeMarks(0);
    setDifficulty("Medium");
    setTopic("");
    setCaseSensitive(false);
    setPartialCredit(false);
    setGradingRubric("");
    setOptions([
      { id: "opt_1", text: "" },
      { id: "opt_2", text: "" },
      { id: "opt_3", text: "" },
      { id: "opt_4", text: "" },
    ]);
    setCorrectAnswers([]);
    setShortAnswerInput("");
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (q: any) => {
    setEditingQuestionId(q._id);
    setQuestionText(q.questionText);
    setQuestionType(q.questionType);
    setImage(q.image || "");
    setExplanation(q.explanation || "");
    setMarks(q.marks || 1);
    setNegativeMarks(q.negativeMarks || 0);
    setDifficulty(q.difficulty || "Medium");
    setTopic(q.topic || "");
    setCaseSensitive(q.caseSensitive || false);
    setPartialCredit(q.partialCredit || false);
    setGradingRubric(q.gradingRubric || "");
    setOptions(
      q.options?.length > 0
        ? q.options
        : [
            { id: "opt_1", text: "" },
            { id: "opt_2", text: "" },
          ],
    );
    setCorrectAnswers(q.correctAnswers || []);
    setShortAnswerInput((q.correctAnswers || []).join(", "));
    setIsModalOpen(true);
  };

  const handleTypeChange = (type: QuestionType) => {
    setQuestionType(type);
    setCorrectAnswers([]);
    if (type === "true_false") {
      setOptions([
        { id: "true", text: "True" },
        { id: "false", text: "False" },
      ]);
    } else if (type === "single_choice" || type === "multiple_choice") {
      setOptions([
        { id: "opt_1", text: "" },
        { id: "opt_2", text: "" },
        { id: "opt_3", text: "" },
        { id: "opt_4", text: "" },
      ]);
    }
  };

  const toggleOptionCorrect = (optId: string) => {
    if (questionType === "single_choice" || questionType === "true_false") {
      setCorrectAnswers([optId]);
    } else if (questionType === "multiple_choice") {
      if (correctAnswers.includes(optId)) {
        setCorrectAnswers(correctAnswers.filter((id) => id !== optId));
      } else {
        setCorrectAnswers([...correctAnswers, optId]);
      }
    }
  };

  const addOption = () => {
    const newId = `opt_${Date.now()}`;
    setOptions([...options, { id: newId, text: "" }]);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) {
      toast.error("At least 2 options are required.");
      return;
    }
    const removedId = options[index].id;
    setOptions(options.filter((_, i) => i !== index));
    setCorrectAnswers(correctAnswers.filter((id) => id !== removedId));
  };

  const updateOptionText = (index: number, text: string) => {
    const updated = [...options];
    updated[index].text = text;
    setOptions(updated);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!questionText.trim()) {
      toast.error("Question text is required.");
      return;
    }

    let finalCorrectAnswers = correctAnswers;

    if (
      questionType === "single_choice" ||
      questionType === "multiple_choice" ||
      questionType === "true_false"
    ) {
      const emptyOptions = options.some((o) => !o.text.trim());
      if (emptyOptions) {
        toast.error("Please fill in text for all options.");
        return;
      }
      if (finalCorrectAnswers.length === 0) {
        toast.error("Please mark at least one correct answer.");
        return;
      }
    } else if (
      questionType === "short_answer" ||
      questionType === "fill_in_the_blank"
    ) {
      const parts = shortAnswerInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (parts.length === 0) {
        toast.error("Please enter at least one accepted correct answer.");
        return;
      }
      finalCorrectAnswers = parts;
    } else if (questionType === "descriptive") {
      finalCorrectAnswers = ["MANUAL_EVALUATION"];
    }

    setIsSubmitting(true);

    const payload: QuestionInput = {
      olympiadId,
      questionText: questionText.trim(),
      questionType,
      image: image.trim() || undefined,
      explanation: explanation.trim() || undefined,
      marks: Number(marks),
      negativeMarks: Number(negativeMarks),
      difficulty,
      topic: topic.trim() || undefined,
      options:
        questionType === "single_choice" ||
        questionType === "multiple_choice" ||
        questionType === "true_false"
          ? options.map((o) => ({ id: o.id, text: o.text.trim() }))
          : undefined,
      correctAnswers: finalCorrectAnswers,
      caseSensitive,
      partialCredit,
      gradingRubric: gradingRubric.trim() || undefined,
    };

    try {
      if (editingQuestionId) {
        await updateQuestion(editingQuestionId, payload);
        toast.success("Question updated successfully.");
      } else {
        await createQuestion(payload);
        toast.success("Question added successfully.");
      }
      setIsModalOpen(false);
      resetForm();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to save question.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      await deleteQuestion(questionId);
      toast.success("Question deleted.");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete question.");
    }
  };

  const totalCalculatedMarks = questions.reduce(
    (acc, q) => acc + (q.marks || 0),
    0,
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" /> Question Builder
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {questions.length} questions configured • Total Marks:{" "}
            <strong>{totalCalculatedMarks}</strong>
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 flex items-center gap-1.5 transition"
        >
          <Plus className="w-4 h-4" /> Add Question
        </button>
      </div>

      {/* Questions List */}
      {questions.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-gray-200">
          <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-700">No questions added yet</h3>
          <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">
            Build your examination question bank with Single Choice, Multiple
            Select, True/False, Short Answer, or Descriptive questions.
          </p>
          <button
            onClick={openCreateModal}
            className="mt-4 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90"
          >
            Add First Question
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q, idx) => (
            <div
              key={q._id}
              className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                    Q{idx + 1}
                  </span>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">
                      {q.questionText}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500">
                      <span className="capitalize bg-gray-100 px-2 py-0.5 rounded font-medium">
                        {q.questionType.replace("_", " ")}
                      </span>
                      <span>• Marks: +{q.marks}</span>
                      {q.negativeMarks > 0 && (
                        <span className="text-red-500">
                          • Penalty: -{q.negativeMarks}
                        </span>
                      )}
                      <span>• Difficulty: {q.difficulty}</span>
                      {q.topic && <span>• Topic: {q.topic}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(q)}
                    className="p-1.5 text-gray-500 hover:text-primary rounded hover:bg-gray-100"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(q._id)}
                    className="p-1.5 text-red-500 hover:text-red-700 rounded hover:bg-red-50"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Render Options Preview */}
              {q.options && q.options.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t text-xs">
                  {q.options.map((opt: any) => {
                    const isCorrect = q.correctAnswers?.includes(opt.id);
                    return (
                      <div
                        key={opt.id}
                        className={`p-2 rounded border flex items-center gap-2 ${
                          isCorrect
                            ? "bg-green-50/80 border-green-200 text-green-900 font-medium"
                            : "bg-gray-50/50 border-gray-200 text-gray-600"
                        }`}
                      >
                        {isCorrect ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
                        ) : (
                          <span className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0" />
                        )}
                        <span>{opt.text}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Short Answer Preview */}
              {(q.questionType === "short_answer" ||
                q.questionType === "fill_in_the_blank") && (
                <div className="pt-2 border-t text-xs text-gray-600">
                  <span className="font-semibold text-gray-700">
                    Accepted Answers:
                  </span>{" "}
                  {q.correctAnswers?.join(" | ")}
                </div>
              )}

              {/* Descriptive Rubric Preview */}
              {q.questionType === "descriptive" && q.gradingRubric && (
                <div className="pt-2 border-t text-xs text-amber-700 bg-amber-50/50 p-2 rounded">
                  <span className="font-semibold">Examiner Rubric:</span>{" "}
                  {q.gradingRubric}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Question Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl my-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900">
                {editingQuestionId ? "Edit Question" : "Add New Question"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Question Text *
                </label>
                <textarea
                  required
                  rows={3}
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="e.g. What is the value of x in the equation 2x + 6 = 18?"
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Question Type *
                  </label>
                  <select
                    value={questionType}
                    onChange={(e) =>
                      handleTypeChange(e.target.value as QuestionType)
                    }
                    className="w-full border rounded-lg p-2 text-xs bg-white focus:outline-none"
                  >
                    <option value="single_choice">Single Choice (MCQ)</option>
                    <option value="multiple_choice">Multiple Select</option>
                    <option value="true_false">True / False</option>
                    <option value="short_answer">Short Answer</option>
                    <option value="fill_in_the_blank">Fill in the Blank</option>
                    <option value="descriptive">
                      Descriptive (Manual Grading)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Marks Awarded *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    required
                    value={marks}
                    onChange={(e) => setMarks(Number(e.target.value))}
                    className="w-full border rounded-lg p-2 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Negative Marks (Penalty)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    value={negativeMarks}
                    onChange={(e) => setNegativeMarks(Number(e.target.value))}
                    className="w-full border rounded-lg p-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) =>
                      setDifficulty(e.target.value as DifficultyLevel)
                    }
                    className="w-full border rounded-lg p-2 text-xs bg-white focus:outline-none"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Topic / Category
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Algebra, Organic Chemistry"
                    className="w-full border rounded-lg p-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Options for MCQ / Multiple Select / True False */}
              {(questionType === "single_choice" ||
                questionType === "multiple_choice" ||
                questionType === "true_false") && (
                <div className="space-y-2 border-t pt-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-gray-700">
                      Options & Correct Answer(s) *
                    </label>
                    {questionType !== "true_false" && (
                      <button
                        type="button"
                        onClick={addOption}
                        className="text-primary text-xs font-semibold hover:underline"
                      >
                        + Add Option
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-gray-500">
                    Click the checkmark circle to designate correct answer(s).
                  </p>

                  <div className="space-y-2">
                    {options.map((opt, idx) => {
                      const isCorrect = correctAnswers.includes(opt.id);
                      return (
                        <div
                          key={opt.id}
                          className="flex items-center gap-2.5 p-2 rounded-lg border bg-gray-50"
                        >
                          <button
                            type="button"
                            onClick={() => toggleOptionCorrect(opt.id)}
                            className={`p-1 rounded-full transition ${
                              isCorrect
                                ? "text-green-600 bg-green-100"
                                : "text-gray-300 hover:text-gray-400"
                            }`}
                            title="Toggle Correct Answer"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>

                          <input
                            type="text"
                            required
                            placeholder={`Option ${idx + 1}`}
                            value={opt.text}
                            onChange={(e) =>
                              updateOptionText(idx, e.target.value)
                            }
                            className="flex-1 border rounded px-2.5 py-1.5 text-xs bg-white focus:outline-none"
                          />

                          {questionType !== "true_false" &&
                            options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removeOption(idx)}
                                className="text-red-400 hover:text-red-600 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                        </div>
                      );
                    })}
                  </div>

                  {questionType === "multiple_choice" && (
                    <label className="flex items-center gap-2 pt-2 text-xs text-gray-600">
                      <input
                        type="checkbox"
                        checked={partialCredit}
                        onChange={(e) => setPartialCredit(e.target.checked)}
                        className="w-3.5 h-3.5 text-primary rounded"
                      />
                      Award partial credit proportional to correct selections
                    </label>
                  )}
                </div>
              )}

              {/* Short Answer / Fill in the blank accepted answers */}
              {(questionType === "short_answer" ||
                questionType === "fill_in_the_blank") && (
                <div className="space-y-2 border-t pt-3">
                  <label className="block text-xs font-semibold text-gray-700">
                    Accepted Correct Answer(s) * (Comma-separated)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 6, six, Six"
                    value={shortAnswerInput}
                    onChange={(e) => setShortAnswerInput(e.target.value)}
                    className="w-full border rounded-lg p-2 text-xs focus:outline-none"
                  />
                  <label className="flex items-center gap-2 text-xs text-gray-600">
                    <input
                      type="checkbox"
                      checked={caseSensitive}
                      onChange={(e) => setCaseSensitive(e.target.checked)}
                      className="w-3.5 h-3.5 text-primary rounded"
                    />
                    Strict Case Sensitivity
                  </label>
                </div>
              )}

              {/* Descriptive Rubric */}
              {questionType === "descriptive" && (
                <div className="space-y-2 border-t pt-3">
                  <label className="block text-xs font-semibold text-gray-700">
                    Examiner Grading Rubric & Expected Answer Key
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Guidelines for examiners when manually scoring student essays..."
                    value={gradingRubric}
                    onChange={(e) => setGradingRubric(e.target.value)}
                    className="w-full border rounded-lg p-2 text-xs focus:outline-none"
                  />
                </div>
              )}

              {/* Explanation */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Explanation & Solution (Disclosed after results publication)
                </label>
                <textarea
                  rows={2}
                  placeholder="Detailed breakdown explaining the correct answer..."
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  className="w-full border rounded-lg p-2 text-xs focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Question"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
