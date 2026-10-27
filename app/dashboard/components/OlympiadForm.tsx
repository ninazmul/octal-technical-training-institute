"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createOlympiad,
  updateOlympiad,
  OlympiadFormValues,
} from "@/lib/actions/olympiad.actions";
import toast from "react-hot-toast";
import {
  Trophy,
  Calendar,
  Clock,
  Award,
  Settings,
  Plus,
  Trash2,
  ArrowLeft,
  Save,
} from "lucide-react";
import Link from "next/link";
import { FileUploader } from "@/components/shared/FileUploader";

interface OlympiadFormProps {
  type: "Create" | "Update";
  olympiad?: any;
  olympiadId?: string;
}

const CATEGORIES = [
  "Mathematics",
  "Science",
  "Programming & ICT",
  "English Language",
  "General Knowledge",
  "Robotics & AI",
  "Physics",
  "Chemistry",
  "Biology",
  "Other",
];

const AVAILABLE_CLASSES = [
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "HSC / College",
  "University",
  "Open for All",
];

export default function OlympiadForm({
  type,
  olympiad,
  olympiadId,
}: OlympiadFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState(olympiad?.title || "");
  const [slug, setSlug] = useState(olympiad?.slug || "");
  const [shortDescription, setShortDescription] = useState(
    olympiad?.shortDescription || "",
  );
  const [description, setDescription] = useState(olympiad?.description || "");
  const [banner, setBanner] = useState(olympiad?.banner || "");
  const [, setBannerFiles] = useState<File[]>([]);
  const [category, setCategory] = useState(olympiad?.category || "Mathematics");
  const [targetClasses, setTargetClasses] = useState<string[]>(
    olympiad?.targetClasses || ["Class 8", "Class 9", "Class 10"],
  );
  const [eligibility, setEligibility] = useState(olympiad?.eligibility || "");
  const [organizer, setOrganizer] = useState(
    olympiad?.organizer || "Octal Technical Training Institute",
  );

  // Dates (format for datetime-local input: YYYY-MM-DDTHH:mm)
  const formatDateForInput = (d?: string | Date) => {
    if (!d) return "";
    const date = new Date(d);
    if (isNaN(date.getTime())) return "";
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  };

  const [registrationStartDate, setRegistrationStartDate] = useState(
    formatDateForInput(olympiad?.registrationStartDate),
  );
  const [registrationDeadline, setRegistrationDeadline] = useState(
    formatDateForInput(olympiad?.registrationDeadline),
  );
  const [examStartDate, setExamStartDate] = useState(
    formatDateForInput(olympiad?.examStartDate),
  );
  const [examEndDate, setExamEndDate] = useState(
    formatDateForInput(olympiad?.examEndDate),
  );
  const [resultsPublishDate, setResultsPublishDate] = useState(
    formatDateForInput(olympiad?.resultsPublishDate),
  );

  // Exam Settings
  const [durationMinutes, setDurationMinutes] = useState(
    olympiad?.durationMinutes ?? 60,
  );
  const [maxCapacity, setMaxCapacity] = useState(olympiad?.maxCapacity ?? 0);
  const [totalMarks, setTotalMarks] = useState(olympiad?.totalMarks ?? 100);
  const [passingMarks, setPassingMarks] = useState(
    olympiad?.passingMarks ?? 40,
  );
  const [negativeMarkingEnabled, setNegativeMarkingEnabled] = useState(
    olympiad?.negativeMarking?.enabled ?? false,
  );
  const [penaltyPerQuestion, setPenaltyPerQuestion] = useState(
    olympiad?.negativeMarking?.penaltyPerQuestion ?? 0.25,
  );

  const [randomizeQuestions, setRandomizeQuestions] = useState(
    olympiad?.randomizeQuestions ?? true,
  );
  const [randomizeOptions, setRandomizeOptions] = useState(
    olympiad?.randomizeOptions ?? true,
  );
  const [allowBackNavigation, setAllowBackNavigation] = useState(
    olympiad?.allowBackNavigation ?? true,
  );
  const [allowReview, setAllowReview] = useState(
    olympiad?.allowReview ?? true,
  );
  const [isResultsPublic, setIsResultsPublic] = useState(
    olympiad?.isResultsPublic ?? true,
  );

  const [instructions, setInstructions] = useState(
    olympiad?.instructions ||
      "1. Make sure you have a stable internet connection.\n2. Answers are saved automatically.\n3. Exam will submit automatically at deadline.",
  );
  const [rules, setRules] = useState(
    olympiad?.rules ||
      "Strict zero-tolerance for plagiarism or external assistance. Tab switching is monitored.",
  );
  const [prizes, setPrizes] = useState(
    olympiad?.prizes ||
      "1st Prize: Certificate & Trophy\n2nd Prize: Medal & Certificate\n3rd Prize: Certificate of Distinction",
  );
  const [status, setStatus] = useState<any>(olympiad?.status || "Draft");

  // Custom Form Fields
  const [customFields, setCustomFields] = useState<any[]>(
    olympiad?.customFields || [],
  );

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (type === "Create" && !slug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-")
          .slice(0, 60),
      );
    }
  };

  const toggleClass = (cls: string) => {
    if (targetClasses.includes(cls)) {
      setTargetClasses(targetClasses.filter((c) => c !== cls));
    } else {
      setTargetClasses([...targetClasses, cls]);
    }
  };

  const addCustomField = () => {
    setCustomFields([
      ...customFields,
      {
        fieldName: `field_${Date.now()}`,
        fieldLabel: "District",
        fieldType: "text",
        required: false,
      },
    ]);
  };

  const removeCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const updateCustomField = (index: number, key: string, val: any) => {
    const updated = [...customFields];
    updated[index] = { ...updated[index], [key]: val };
    setCustomFields(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !slug.trim()) {
      toast.error("Title and URL Slug are required.");
      return;
    }

    if (!registrationStartDate || !registrationDeadline) {
      toast.error("Please configure registration start date and deadline.");
      return;
    }

    if (!examStartDate || !examEndDate) {
      toast.error("Please configure examination start and end dates.");
      return;
    }

    if (new Date(registrationDeadline) <= new Date(registrationStartDate)) {
      toast.error("Registration deadline must be after registration start date.");
      return;
    }

    if (new Date(examStartDate) < new Date(registrationDeadline)) {
      toast.error("Examination start date must be after registration deadline.");
      return;
    }

    if (new Date(examEndDate) <= new Date(examStartDate)) {
      toast.error("Examination end date must be after examination start date.");
      return;
    }

    setIsSubmitting(true);

    const payload: OlympiadFormValues = {
      title: title.trim(),
      slug: slug.trim().toLowerCase(),
      shortDescription: shortDescription.trim(),
      description: description.trim(),
      banner: banner.trim() || undefined,
      category,
      targetClasses,
      eligibility: eligibility.trim() || undefined,
      organizer: organizer.trim(),
      registrationStartDate: new Date(registrationStartDate).toISOString(),
      registrationDeadline: new Date(registrationDeadline).toISOString(),
      examStartDate: new Date(examStartDate).toISOString(),
      examEndDate: new Date(examEndDate).toISOString(),
      resultsPublishDate: new Date(
        resultsPublishDate || examEndDate,
      ).toISOString(),
      durationMinutes: Number(durationMinutes),
      maxCapacity: Number(maxCapacity),
      totalMarks: Number(totalMarks),
      passingMarks: Number(passingMarks),
      negativeMarking: {
        enabled: negativeMarkingEnabled,
        penaltyPerQuestion: Number(penaltyPerQuestion),
      },
      randomizeQuestions,
      randomizeOptions,
      allowBackNavigation,
      allowReview,
      isResultsPublic,
      instructions: instructions.trim(),
      rules: rules.trim(),
      prizes: prizes.trim(),
      status,
      customFields,
    };

    try {
      if (type === "Create") {
        const res = await createOlympiad(payload);
        if (res) {
          toast.success("Olympiad created successfully!");
          router.push(`/dashboard/olympiads/${res._id}`);
        }
      } else {
        const res = await updateOlympiad(olympiadId!, payload);
        if (res) {
          toast.success("Olympiad updated successfully!");
          router.push(`/dashboard/olympiads/${olympiadId}`);
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save Olympiad.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/olympiads"
            className="p-2 border rounded-lg hover:bg-gray-100 transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {type === "Create" ? "Create New Olympiad" : `Edit: ${title}`}
            </h1>
            <p className="text-sm text-gray-500">
              Configure schedule, eligibility, examination timing, and rules.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary text-white px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 font-medium transition disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSubmitting
            ? "Saving..."
            : type === "Create"
            ? "Create Olympiad"
            : "Save Changes"}
        </button>
      </div>

      {/* 1. Basic Information */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" /> Basic Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Olympiad Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. National Math Olympiad 2026"
              className="w-full border rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL Slug *
            </label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="national-math-olympiad-2026"
              className="w-full border rounded-lg px-3.5 py-2 text-sm font-mono focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category / Subject *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organizer
            </label>
            <input
              type="text"
              value={organizer}
              onChange={(e) => setOrganizer(e.target.value)}
              className="w-full border rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Short Description (Card view & SEO) *
          </label>
          <input
            type="text"
            required
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="A nationwide academic competition for high school problem solvers."
            className="w-full border rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Description & Overview *
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed details regarding syllabus, eligibility, and program highlights..."
            className="w-full border rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cover Banner Image
          </label>
          <FileUploader
            imageUrl={banner}
            setFiles={setBannerFiles}
            onFieldChange={(url) => setBanner(url)}
          />
          <input
            type="url"
            value={banner}
            onChange={(e) => setBanner(e.target.value)}
            placeholder="Or paste an image URL (https://...)"
            className="mt-2 w-full border rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
          />
          <p className="mt-1 text-xs text-gray-500">
            Upload a banner or paste a direct URL. Recommended 1200×630 for
            social sharing previews.
          </p>
        </div>

        {/* Target Classes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Eligible Classes / Grade Levels *
          </label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_CLASSES.map((cls) => {
              const active = targetClasses.includes(cls);
              return (
                <button
                  type="button"
                  key={cls}
                  onClick={() => toggleClass(cls)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                    active
                      ? "bg-primary text-white border-primary"
                      : "bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {cls} {active && "✓"}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Schedule & Time Windows */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" /> Schedule & Time Windows
          (Asia/Dhaka)
        </h2>
        <p className="text-xs text-gray-500">
          Timestamps are stored in UTC and calculated authoritative to server
          time.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Registration Start Date & Time *
            </label>
            <input
              type="datetime-local"
              required
              value={registrationStartDate}
              onChange={(e) => setRegistrationStartDate(e.target.value)}
              className="w-full border rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Registration Deadline *
            </label>
            <input
              type="datetime-local"
              required
              value={registrationDeadline}
              onChange={(e) => setRegistrationDeadline(e.target.value)}
              className="w-full border rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Examination Start Window *
            </label>
            <input
              type="datetime-local"
              required
              value={examStartDate}
              onChange={(e) => setExamStartDate(e.target.value)}
              className="w-full border rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Examination End Window *
            </label>
            <input
              type="datetime-local"
              required
              value={examEndDate}
              onChange={(e) => setExamEndDate(e.target.value)}
              className="w-full border rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Results Publication Date & Time *
          </label>
          <input
            type="datetime-local"
            required
            value={resultsPublishDate}
            onChange={(e) => setResultsPublishDate(e.target.value)}
            className="w-full border rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>
      </div>

      {/* 3. Examination Configuration & Rules */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" /> Examination Parameters &
          Grading Rules
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (Minutes) *
            </label>
            <input
              type="number"
              min={1}
              required
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full border rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Marks
            </label>
            <input
              type="number"
              min={1}
              value={totalMarks}
              onChange={(e) => setTotalMarks(Number(e.target.value))}
              className="w-full border rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Passing Marks
            </label>
            <input
              type="number"
              min={0}
              value={passingMarks}
              onChange={(e) => setPassingMarks(Number(e.target.value))}
              className="w-full border rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Participant Capacity (0 = Unlimited)
            </label>
            <input
              type="number"
              min={0}
              value={maxCapacity}
              onChange={(e) => setMaxCapacity(Number(e.target.value))}
              className="w-full border rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Publication Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="Draft">Draft (Hidden from Public)</option>
              <option value="Published">Published (Public)</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Negative Marking */}
        <div className="p-4 bg-gray-50 border rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="font-medium text-gray-900 text-sm block">
              Negative Marking
            </span>
            <span className="text-xs text-gray-500">
              Deduct penalty marks for incorrect objective responses.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={negativeMarkingEnabled}
                onChange={(e) => setNegativeMarkingEnabled(e.target.checked)}
                className="w-4 h-4 text-primary rounded"
              />
              Enable
            </label>

            {negativeMarkingEnabled && (
              <input
                type="number"
                step="0.05"
                min={0}
                value={penaltyPerQuestion}
                onChange={(e) => setPenaltyPerQuestion(Number(e.target.value))}
                placeholder="Penalty (e.g. 0.25)"
                className="w-24 border rounded px-2 py-1 text-xs"
              />
            )}
          </div>
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <label className="flex items-center gap-2.5 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 text-sm">
            <input
              type="checkbox"
              checked={randomizeQuestions}
              onChange={(e) => setRandomizeQuestions(e.target.checked)}
              className="w-4 h-4 text-primary rounded"
            />
            <span>Randomize Question Order per student</span>
          </label>

          <label className="flex items-center gap-2.5 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 text-sm">
            <input
              type="checkbox"
              checked={randomizeOptions}
              onChange={(e) => setRandomizeOptions(e.target.checked)}
              className="w-4 h-4 text-primary rounded"
            />
            <span>Randomize MCQ Option Choices</span>
          </label>

          <label className="flex items-center gap-2.5 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 text-sm">
            <input
              type="checkbox"
              checked={allowBackNavigation}
              onChange={(e) => setAllowBackNavigation(e.target.checked)}
              className="w-4 h-4 text-primary rounded"
            />
            <span>Allow Previous / Back Navigation</span>
          </label>

          <label className="flex items-center gap-2.5 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 text-sm">
            <input
              type="checkbox"
              checked={isResultsPublic}
              onChange={(e) => setIsResultsPublic(e.target.checked)}
              className="w-4 h-4 text-primary rounded"
            />
            <span>Public Leaderboard & Rankings</span>
          </label>
        </div>
      </div>

      {/* 4. Instructions, Rules & Prizes */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" /> Instructions, Rules & Prizes
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Exam Instructions (Shown to students before exam starts)
          </label>
          <textarea
            rows={3}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="w-full border rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Code of Conduct & Disciplinary Rules
          </label>
          <textarea
            rows={2}
            value={rules}
            onChange={(e) => setRules(e.target.value)}
            className="w-full border rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Awards & Distinctions
          </label>
          <textarea
            rows={2}
            value={prizes}
            onChange={(e) => setPrizes(e.target.value)}
            className="w-full border rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>
      </div>

      {/* 5. Custom Registration Fields */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" /> Custom Registration
              Fields
            </h2>
            <p className="text-xs text-gray-500">
              Collect additional participant data (e.g. District, Roll Number,
              Guardian Phone).
            </p>
          </div>
          <button
            type="button"
            onClick={addCustomField}
            className="border border-primary text-primary px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-primary/5 transition"
          >
            <Plus className="w-3.5 h-3.5" /> Add Field
          </button>
        </div>

        {customFields.length === 0 ? (
          <p className="text-xs text-gray-400 italic">
            Standard fields (Full Name, Email, Phone Number, Institution, Class,
            Roll) are collected automatically.
          </p>
        ) : (
          <div className="space-y-3">
            {customFields.map((field, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <input
                  type="text"
                  placeholder="Field Label (e.g. District)"
                  value={field.fieldLabel}
                  onChange={(e) =>
                    updateCustomField(idx, "fieldLabel", e.target.value)
                  }
                  className="flex-1 border rounded px-3 py-1.5 text-xs bg-white"
                />

                <select
                  value={field.fieldType}
                  onChange={(e) =>
                    updateCustomField(idx, "fieldType", e.target.value)
                  }
                  className="border rounded px-3 py-1.5 text-xs bg-white"
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                </select>

                <label className="flex items-center gap-1.5 text-xs text-gray-600">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) =>
                      updateCustomField(idx, "required", e.target.checked)
                    }
                    className="w-3.5 h-3.5 text-primary rounded"
                  />
                  Required
                </label>

                <button
                  type="button"
                  onClick={() => removeCustomField(idx)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Link
          href="/dashboard/olympiads"
          className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-100 font-medium text-sm transition"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary text-white px-7 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-primary/90 transition disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSubmitting
            ? "Saving..."
            : type === "Create"
            ? "Create Olympiad"
            : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
