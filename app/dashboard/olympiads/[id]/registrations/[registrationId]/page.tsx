import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getOlympiadRegistrationAdmin } from "@/lib/actions/olympiad-registration.actions";
import { getOlympiadByIdAdmin } from "@/lib/actions/olympiad.actions";
import { formatDhakaDateTime } from "@/lib/olympiad-lifecycle";

type PageProps = {
  params: Promise<{ id: string; registrationId: string }>;
};

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="mt-1 break-words text-sm font-semibold text-gray-900">{value || "—"}</dd>
    </div>
  );
}

export default async function OlympiadRegistrationDetailsPage({ params }: PageProps) {
  const { id, registrationId } = await params;
  const [olympiad, registration] = await Promise.all([
    getOlympiadByIdAdmin(id),
    getOlympiadRegistrationAdmin(id, registrationId),
  ]);

  if (!olympiad || !registration) notFound();

  const customFields = Object.entries(registration.customData || {}).map(
    ([fieldName, value]) => [
      olympiad.customFields?.find((field: { fieldName: string }) => field.fieldName === fieldName)?.fieldLabel || fieldName,
      value,
    ] as const,
  );

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
      <Link
        href={`/dashboard/olympiads/${id}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Back to {olympiad.title}
      </Link>

      <header>
        <p className="text-sm font-medium text-primary">Olympiad registration</p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">{registration.studentName}</h1>
        <p className="mt-1 font-mono text-sm text-gray-500">{registration.registrationNumber}</p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="overflow-hidden rounded-xl border bg-white">
          <h2 className="border-b px-4 py-3 font-semibold text-gray-900">Participant photo</h2>
          {registration.photo ? (
            <a href={registration.photo} target="_blank" rel="noreferrer" className="block bg-gray-50 p-4">
              <Image src={registration.photo} alt={`${registration.studentName} participant photo`} width={800} height={800} className="mx-auto max-h-[420px] w-auto object-contain" />
            </a>
          ) : <p className="p-4 text-sm text-gray-500">No participant photo available.</p>}
        </div>
        <div className="overflow-hidden rounded-xl border bg-white">
          <h2 className="border-b px-4 py-3 font-semibold text-gray-900">Student ID card</h2>
          {registration.idCardPhoto ? (
            <a href={registration.idCardPhoto} target="_blank" rel="noreferrer" className="block bg-gray-50 p-4">
              <Image src={registration.idCardPhoto} alt={`${registration.studentName} student ID card`} width={1000} height={700} className="mx-auto max-h-[420px] w-auto object-contain" />
            </a>
          ) : <p className="p-4 text-sm text-gray-500">No student ID card image available.</p>}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">Student information</h2>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Detail label="Full name" value={registration.studentName} />
          <Detail label="Email" value={registration.email} />
          <Detail label="Phone" value={registration.phoneNumber} />
          <Detail label="Institution" value={registration.institution} />
          <Detail label="Class / grade" value={registration.grade} />
          <Detail label="Class roll / student ID" value={registration.rollNumber} />
          <Detail label="District" value={registration.district} />
          <Detail label="Date of birth" value={registration.dateOfBirth} />
          <Detail label="Guardian phone" value={registration.guardianPhone} />
          <Detail label="Registration number" value={registration.registrationNumber} />
          <Detail label="Status" value={registration.status} />
          <Detail label="Registered at" value={formatDhakaDateTime(registration.createdAt)} />
        </dl>
      </section>

      {customFields.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Additional information</h2>
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {customFields.map(([label, value]) => (
              <Detail key={label} label={label} value={String(value ?? "")} />
            ))}
          </dl>
        </section>
      )}
    </main>
  );
}
