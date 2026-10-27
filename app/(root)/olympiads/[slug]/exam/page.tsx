import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Lock } from "lucide-react";
import { getOlympiadBySlugPublic } from "@/lib/actions/olympiad.actions";
import { getSetting } from "@/lib/actions/setting.actions";
import { formatDhakaDateTime } from "@/lib/olympiad-lifecycle";
import OlympiadExamEngine from "@/components/shared/OlympiadExamEngine";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const metadata: Metadata = {
  title: "Live Examination Portal | Octal Technical Training Institute",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function OlympiadExamPage({ params }: PageProps) {
  const { slug } = await params;
  const [olympiad, settings] = await Promise.all([
    getOlympiadBySlugPublic(slug),
    getSetting(),
  ]);

  if (!olympiad) {
    notFound();
  }

  const themeColor = settings?.theme || "#0055CE";

  // The examination portal is disabled by default and only opens during the
  // scheduled examination window. Direct URL access outside that window is blocked.
  if (!olympiad.lifecycle?.canEnterExam) {
    return (
      <div className="min-h-screen bg-gray-100/70 py-16 px-4 md:px-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-gray-200 shadow-sm text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto bg-gray-100 text-gray-500">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h1 className="text-xl font-extrabold text-gray-900">
              Examination Portal Closed
            </h1>
            <p className="text-sm text-gray-500">
              {olympiad.lifecycle?.label ||
                "The examination portal is not open right now."}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
            <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
            <span>
              Exam window: {formatDhakaDateTime(olympiad.examStartDate)} —{" "}
              {formatDhakaDateTime(olympiad.examEndDate)}
            </span>
          </div>

          <p className="text-[11px] text-gray-400 leading-relaxed">
            This portal opens automatically during the scheduled examination time.
            You will be able to enter using your registered email address or
            Registration Number.
          </p>

          <Link
            href={`/olympiads/${slug}`}
            className="inline-flex items-center justify-center w-full py-3 rounded-xl text-white font-bold text-sm shadow-sm hover:opacity-95 transition"
            style={{ backgroundColor: themeColor }}
          >
            Back to Olympiad Details
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100/70 py-6 px-4 md:px-8">
      <OlympiadExamEngine olympiadSlug={slug} themeColor={themeColor} />
    </div>
  );
}
