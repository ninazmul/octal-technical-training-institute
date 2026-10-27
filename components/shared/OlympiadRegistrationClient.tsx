"use client";

import { useState } from "react";
import Link from "next/link";
import {
  registerForOlympiad,
  RegistrationInput,
} from "@/lib/actions/olympiad-registration.actions";
import { formatDhakaDateTime } from "@/lib/olympiad-lifecycle";
import { FileUploader } from "@/components/shared/FileUploader";
import toast from "react-hot-toast";
import {
  Trophy,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  User,
  Mail,
  Phone,
  School,
  IdCard,
} from "lucide-react";

interface OlympiadRegistrationClientProps {
  olympiad: any;
  themeColor?: string;
}

export default function OlympiadRegistrationClient({
  olympiad,
  themeColor = "#0055CE",
}: OlympiadRegistrationClientProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationData, setConfirmationData] = useState<any | null>(null);

  // Form Fields
  const [studentName, setStudentName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [institution, setInstitution] = useState("");
  const [grade, setGrade] = useState(olympiad.targetClasses?.[0] || "Class 8");
  const [rollNumber, setRollNumber] = useState("");
  const [district, setDistrict] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [photo, setPhoto] = useState("");
  const [customData, setCustomData] = useState<Record<string, any>>({});

  const handleCustomFieldChange = (key: string, val: any) => {
    setCustomData((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentName.trim() || !email.trim() || !phoneNumber.trim()) {
      toast.error("Please fill in all required contact information.");
      return;
    }

    setIsSubmitting(true);

    const payload: RegistrationInput = {
      olympiadId: olympiad._id,
      studentName: studentName.trim(),
      email: email.trim().toLowerCase(),
      phoneNumber: phoneNumber.trim(),
      institution: institution.trim(),
      grade,
      rollNumber: rollNumber.trim(),
      district: district.trim() || undefined,
      dateOfBirth: dateOfBirth.trim() || undefined,
      guardianPhone: guardianPhone.trim() || undefined,
      photo: photo || undefined,
      customData,
    };

    try {
      const res = await registerForOlympiad(payload);
      if (res && res.success) {
        toast.success("Registration successful!");
        setConfirmationData(res);
      }
    } catch (err: any) {
      toast.error(err.message || "Registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // If successfully registered, show clear confirmation slip
  if (confirmationData) {
    return (
      <div className="max-w-2xl mx-auto my-8 bg-white p-8 md:p-10 rounded-3xl border border-gray-200 shadow-lg text-center space-y-6">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-green-600">
            Registration Confirmed
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-1">
            স্বাগতম, {studentName}!
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            You are officially registered for{" "}
            <strong>{confirmationData.olympiadTitle}</strong>.
          </p>
        </div>

        <div className="p-6 bg-blue-50/70 border border-blue-200 rounded-2xl text-left space-y-3">
          <div className="flex items-center justify-between border-b border-blue-200/60 pb-3">
            <span className="text-xs text-gray-500 font-medium">
              Registration Number
            </span>
            <span className="font-mono font-extrabold text-lg text-primary">
              {confirmationData.registrationNumber}
            </span>
          </div>

          <div className="text-xs text-gray-700 space-y-1.5 pt-1">
            <div>
              <span className="text-gray-500">Exam Starts:</span>{" "}
              <strong>{formatDhakaDateTime(olympiad.examStartDate)}</strong>
            </div>
            <div>
              <span className="text-gray-500">Duration:</span>{" "}
              <strong>{olympiad.durationMinutes} Minutes</strong>
            </div>
            <div>
              <span className="text-gray-500">Registered Email:</span>{" "}
              {email}
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-xl text-xs text-gray-600 text-left border">
          <div className="font-bold text-gray-800 mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-primary" /> Notice Sent
          </div>
          Confirmation SMS and Email with your exam portal access link have been
          dispatched to your contact details. Please keep your Registration
          Number safe.
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href={`/olympiads/${confirmationData.slug}/exam`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-bold transition hover:opacity-95 text-sm"
            style={{ backgroundColor: themeColor }}
          >
            Go to Examination Portal <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href={`/olympiads/${confirmationData.slug}`}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 text-sm transition"
          >
            Back to Olympiad Details
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto my-6 bg-white p-6 md:p-10 rounded-3xl border border-gray-200 shadow-sm space-y-6">
      <div>
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2"
          style={{
            backgroundColor: `${themeColor}15`,
            color: themeColor,
          }}
        >
          <Trophy className="w-3.5 h-3.5" /> Participant Registration
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
          {olympiad.title}
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Registration Deadline:{" "}
          <strong>{formatDhakaDateTime(olympiad.registrationDeadline)}</strong>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            Student Full Name *
          </label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              required
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="e.g. Abdullah Al Mamun"
              className="w-full pl-9 pr-3.5 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                className="w-full pl-9 pr-3.5 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Phone Number (Bangladesh) *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="017XXXXXXXX"
                className="w-full pl-9 pr-3.5 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Institution & Grade */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              School / College / Institution *
            </label>
            <div className="relative">
              <School className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                required
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g. Dhaka Residential Model College"
                className="w-full pl-9 pr-3.5 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Class / Grade *
            </label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full px-3.5 py-2.5 border rounded-xl text-sm bg-white focus:ring-2 focus:ring-primary focus:outline-none"
            >
              {olympiad.targetClasses?.map((cls: string) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Roll & District */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Class Roll / Student ID *
            </label>
            <div className="relative">
              <IdCard className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                required
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="e.g. 104"
                className="w-full pl-9 pr-3.5 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              District
            </label>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="e.g. Dhaka, Chittagong"
              className="w-full px-3.5 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Date of Birth & Guardian Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full px-3.5 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Guardian Contact Number
            </label>
            <input
              type="tel"
              value={guardianPhone}
              onChange={(e) => setGuardianPhone(e.target.value)}
              placeholder="018XXXXXXXX"
              className="w-full px-3.5 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Participant Photo */}
        <div className="pt-2 space-y-2 border-t">
          <div>
            <label className="block text-xs font-bold text-gray-700">
              Participant Photo
            </label>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Upload a recent passport-size photograph (JPG or PNG, max 5MB).
            </p>
          </div>
          <FileUploader
            imageUrl={photo}
            setFiles={() => {}}
            onFieldChange={(url) => setPhoto(url)}
          />
        </div>

        {/* Custom Form Fields configured by Admin */}
        {olympiad.customFields && olympiad.customFields.length > 0 && (
          <div className="pt-2 space-y-3 border-t">
            {olympiad.customFields.map((field: any) => (
              <div key={field.fieldName}>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {field.fieldLabel} {field.required && "*"}
                </label>
                <input
                  type={field.fieldType === "number" ? "number" : "text"}
                  required={field.required}
                  value={customData[field.fieldName] || ""}
                  onChange={(e) =>
                    handleCustomFieldChange(field.fieldName, e.target.value)
                  }
                  className="w-full px-3.5 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            ))}
          </div>
        )}

        <div className="pt-4 border-t">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl text-white font-bold text-sm shadow-md transition hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ backgroundColor: themeColor }}
          >
            {isSubmitting ? "Processing..." : "Complete Olympiad Registration"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
