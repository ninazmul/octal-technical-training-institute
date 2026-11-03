"use client";

import { useEffect, useState, useTransition } from "react";
import { CheckCircle2, Search, ShieldCheck, XCircle } from "lucide-react";
import { verifyOlympiadCertificate } from "@/lib/actions/olympiad-exam.actions";

type Result = Awaited<ReturnType<typeof verifyOlympiadCertificate>>;

export default function OlympiadCertificateVerification({
  slug,
  registration = "",
  compact = false,
}: {
  slug: string;
  registration?: string;
  compact?: boolean;
}) {
  const [result, setResult] = useState<Result | null>(null);
  const [busy, startTransition] = useTransition();
  const [autoChecked, setAutoChecked] = useState(false);

  useEffect(() => {
    if (!registration || autoChecked) return;
    setAutoChecked(true);
    startTransition(async () => {
      setResult(await verifyOlympiadCertificate({ olympiadSlug: slug, registrationNumber: registration }));
    });
  }, [registration, autoChecked, slug]);

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      setResult(await verifyOlympiadCertificate({
        olympiadSlug: slug,
        registrationNumber: String(formData.get("registrationNumber") || ""),
        studentName: String(formData.get("studentName") || ""),
        institution: String(formData.get("institution") || ""),
      }));
    });
  };

  return (
    <section className={`rounded-2xl border border-gray-200 bg-white shadow-sm ${compact ? "p-5" : "p-6 md:p-8"}`}>
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-primary"><ShieldCheck className="h-6 w-6" /></span>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Verify a winner certificate</h2>
          <p className="text-sm text-gray-500">Check the official Olympiad result using the details printed on the certificate.</p>
        </div>
      </div>
      <form action={handleSubmit} className="grid gap-3 sm:grid-cols-2">
        <input name="registrationNumber" defaultValue={registration} required placeholder="Certificate / registration number" className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary sm:col-span-2" />
        <input name="studentName" required placeholder="Winner name" className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary" />
        <input name="institution" required placeholder="School / institution" className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary" />
        <button disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60 sm:col-span-2">
          <Search className="h-4 w-4" /> {busy ? "Checking..." : "Verify certificate"}
        </button>
      </form>
      {result && (
        <div className={`mt-5 rounded-xl border p-4 ${result.verified ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}`} aria-live="polite">
          <div className={`flex items-center gap-2 font-bold ${result.verified ? "text-green-800" : "text-amber-800"}`}>
            {result.verified ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
            {result.verified ? "Certificate verified" : "Certificate not verified"}
          </div>
          {result.verified ? (
            <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              <div><dt className="text-gray-500">Winner</dt><dd className="font-semibold text-gray-900">{result.studentName}</dd></div>
              <div><dt className="text-gray-500">School / institution</dt><dd className="font-semibold text-gray-900">{result.institution}</dd></div>
              <div><dt className="text-gray-500">Class</dt><dd className="font-semibold text-gray-900">{result.grade}</dd></div>
              <div><dt className="text-gray-500">Olympiad</dt><dd className="font-semibold text-gray-900">{result.olympiadTitle}</dd></div>
              <div><dt className="text-gray-500">Official rank</dt><dd className="font-semibold text-gray-900">#{result.rank}</dd></div>
              <div><dt className="text-gray-500">Score</dt><dd className="font-semibold text-gray-900">{result.totalScore}/{result.maxScore} ({result.percentage}%)</dd></div>
              <div className="sm:col-span-2"><dt className="text-gray-500">Registration number</dt><dd className="font-mono font-semibold text-gray-900">{result.registrationNumber}</dd></div>
            </dl>
          ) : <p className="mt-1 text-sm text-amber-900">{result.message}</p>}
        </div>
      )}
    </section>
  );
}
