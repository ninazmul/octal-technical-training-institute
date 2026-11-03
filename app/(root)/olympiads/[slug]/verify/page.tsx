import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { getOlympiadBySlugPublic } from "@/lib/actions/olympiad.actions";
import OlympiadCertificateVerification from "@/components/shared/OlympiadCertificateVerification";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ registration?: string }>;
};

export const revalidate = 0;

export default async function VerifyOlympiadCertificatePage({ params, searchParams }: PageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const olympiad = await getOlympiadBySlugPublic(slug);
  if (!olympiad) notFound();

  return (
    <main className="min-h-screen bg-gray-50/70 px-5 py-10 md:px-12">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link href={`/olympiads/${slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-primary"><ArrowLeft className="h-4 w-4" /> Back to {olympiad.title}</Link>
        <header className="rounded-3xl bg-primary p-8 text-white shadow-sm">
          <ShieldCheck className="mb-3 h-9 w-9" />
          <h1 className="text-3xl font-extrabold">Certificate verification</h1>
          <p className="mt-2 text-sm text-white/80">Verify an official winner certificate for {olympiad.title}.</p>
        </header>
        <OlympiadCertificateVerification slug={slug} registration={query.registration || ""} />
      </div>
    </main>
  );
}
