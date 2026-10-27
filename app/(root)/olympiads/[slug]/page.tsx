import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getOlympiadBySlugPublic } from "@/lib/actions/olympiad.actions";
import { getSetting } from "@/lib/actions/setting.actions";
import { formatDhakaDateTime } from "@/lib/olympiad-lifecycle";
import { generateBreadcrumbSchema } from "@/lib/structured-data";
import {
  Trophy,
  Calendar,
  Clock,
  Award,
  Users,
  CheckCircle,
  FileText,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 60;

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const olympiad = await getOlympiadBySlugPublic(slug);

  if (!olympiad) {
    return { title: "Olympiad Not Found | Octal LMS" };
  }

  const title = `${olympiad.title} | Octal Technical Training Institute`;
  const description =
    olympiad.shortDescription ||
    `Register for ${olympiad.title} at Octal Technical Training Institute.`;

  return {
    title,
    description,
    keywords: [
      olympiad.title,
      olympiad.category,
      "Olympiad Bangladesh",
      "Competitive Exam",
      "Octal LMS",
      ...(olympiad.targetClasses || []),
    ],
    alternates: {
      canonical: `https://octal.edu.bd/olympiads/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://octal.edu.bd/olympiads/${slug}`,
      siteName: "Octal Technical Training Institute",
      images: olympiad.banner
        ? [{ url: olympiad.banner, width: 1200, height: 630, alt: olympiad.title }]
        : [{ url: "https://octal.edu.bd/assets/images/placeholder.png", width: 1200, height: 630 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: olympiad.banner ? [olympiad.banner] : ["/assets/images/placeholder.png"],
    },
  };
}

export default async function OlympiadDetailsPage({ params }: PageProps) {
  const { slug } = await params;
  const [olympiad, settings] = await Promise.all([
    getOlympiadBySlugPublic(slug),
    getSetting(),
  ]);

  if (!olympiad) {
    notFound();
  }

  const themeColor = settings?.theme || "#0055CE";
  const lifecycle = olympiad.lifecycle;
  const isOpen = lifecycle?.state === "registration_open";
  const isLive = lifecycle?.state === "exam_live";
  const isResultsOut = lifecycle?.state === "results_published";

  const breadcrumbSchema = generateBreadcrumbSchema({
    items: [
      { name: "Home", url: "https://octal.edu.bd" },
      { name: "Olympiads", url: "https://octal.edu.bd/olympiads" },
      { name: olympiad.title, url: `https://octal.edu.bd/olympiads/${slug}` },
    ],
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="min-h-screen bg-gray-50/50 py-10 px-6 md:px-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Top Banner Card */}
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
            {olympiad.banner && (
              <div className="relative w-full h-56 sm:h-72 md:h-80 bg-gray-900">
                <Image
                  src={olympiad.banner}
                  alt={olympiad.title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              </div>
            )}

            <div className="p-6 md:p-10 space-y-6">
              {/* Category & Status */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                    style={{
                      backgroundColor: `${themeColor}15`,
                      color: themeColor,
                    }}
                  >
                    {olympiad.category}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    Organizer: {olympiad.organizer}
                  </span>
                </div>

                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border ${
                    isOpen
                      ? "bg-green-50 text-green-700 border-green-200"
                      : isLive
                      ? "bg-red-50 text-red-700 border-red-200 animate-pulse"
                      : isResultsOut
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-gray-50 text-gray-600 border-gray-200"
                  }`}
                >
                  {lifecycle?.label || olympiad.status}
                </span>
              </div>

              {/* Title & Short Desc */}
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
                  {olympiad.title}
                </h1>
                <p className="text-base md:text-lg text-gray-600 mt-2">
                  {olympiad.shortDescription}
                </p>
              </div>

              {/* Key Metric Blocks */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <div>
                  <span className="text-xs font-medium text-gray-500 block">
                    পরীক্ষার সময়
                  </span>
                  <strong className="text-sm font-bold text-gray-900">
                    {formatDhakaDateTime(olympiad.examStartDate)}
                  </strong>
                </div>

                <div>
                  <span className="text-xs font-medium text-gray-500 block">
                    সময়কাল
                  </span>
                  <strong className="text-sm font-bold text-gray-900">
                    {olympiad.durationMinutes} মিনিট
                  </strong>
                </div>

                <div>
                  <span className="text-xs font-medium text-gray-500 block">
                    মোট নম্বর
                  </span>
                  <strong className="text-sm font-bold text-gray-900">
                    {olympiad.totalMarks} Marks
                  </strong>
                </div>

                <div>
                  <span className="text-xs font-medium text-gray-500 block">
                    নিবন্ধন অবস্থা
                  </span>
                  <strong
                    className={`text-sm font-bold ${
                      isOpen ? "text-green-600" : "text-gray-700"
                    }`}
                  >
                    {isOpen ? "Open" : "Closed"}
                  </strong>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                {isResultsOut ? (
                  <Link
                    href={`/olympiads/${slug}/leaderboard`}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white shadow-sm hover:opacity-95 transition"
                    style={{ backgroundColor: themeColor }}
                  >
                    <Award className="w-5 h-5" /> অফিশিয়াল ফলাফল ও র‍্যাঙ্কিং দেখুন
                  </Link>
                ) : isLive ? (
                  <Link
                    href={`/olympiads/${slug}/exam`}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm transition animate-pulse"
                  >
                    পরীক্ষায় অংশ নিন (Exam Live) <ArrowRight className="w-5 h-5" />
                  </Link>
                ) : isOpen ? (
                  <Link
                    href={`/olympiads/${slug}/register`}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white shadow-sm hover:opacity-95 transition"
                    style={{ backgroundColor: themeColor }}
                  >
                    অনলাইন রেজিস্ট্রেশন করুন <ArrowRight className="w-5 h-5" />
                  </Link>
                ) : (
                  <span className="inline-block px-5 py-2.5 rounded-lg bg-gray-100 text-gray-500 text-sm font-medium">
                    নিবন্ধন উইন্ডো সমাপ্ত হয়েছে
                  </span>
                )}

                <Link
                  href={`/olympiads/${slug}/exam`}
                  className="inline-flex items-center gap-1.5 px-6 py-3.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition text-sm"
                >
                  পরীক্ষার পোর্টাল প্রবেশ
                </Link>
              </div>
            </div>
          </div>

          {/* Details Content Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Full Description */}
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" /> অলিম্পিয়াড বিস্তারিত বিবরণ
                </h2>
                <div className="text-gray-700 text-sm md:text-base leading-relaxed whitespace-pre-line">
                  {olympiad.description}
                </div>
              </div>

              {/* Instructions */}
              {olympiad.instructions && (
                <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-3">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" /> পরীক্ষার নির্দেশনা
                  </h2>
                  <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded-xl border border-gray-100">
                    {olympiad.instructions}
                  </div>
                </div>
              )}

              {/* Rules & Disciplinary */}
              {olympiad.rules && (
                <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-3">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-amber-600" /> শৃঙ্খলা ও নিয়মাবলী
                  </h2>
                  <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                    {olympiad.rules}
                  </div>
                </div>
              )}
            </div>

            {/* Right 1 Col: Eligibility & Summary */}
            <div className="space-y-6">
              {/* Target Classes & Eligibility */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <h3 className="font-bold text-gray-900 text-base">
                  যোগ্যতা ও শ্রেণী
                </h3>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-gray-500 block">
                    অংশগ্রহণকারী শ্রেণী:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {olympiad.targetClasses?.map((cls: string) => (
                      <span
                        key={cls}
                        className="text-xs bg-primary/10 text-primary font-semibold px-2.5 py-1 rounded-md"
                      >
                        {cls}
                      </span>
                    ))}
                  </div>
                </div>

                {olympiad.eligibility && (
                  <div className="pt-2 border-t text-xs text-gray-600">
                    <strong className="text-gray-700 block mb-1">
                      বিশেষ শর্তাবলী:
                    </strong>
                    {olympiad.eligibility}
                  </div>
                )}
              </div>

              {/* Prizes & Distinctions */}
              {olympiad.prizes && (
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-3">
                  <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" /> পুরস্কার ও স্বীকৃতি
                  </h3>
                  <div className="text-xs text-gray-700 leading-relaxed whitespace-pre-line bg-amber-50/40 p-3.5 rounded-xl border border-amber-100">
                    {olympiad.prizes}
                  </div>
                </div>
              )}

              {/* Timeline Card */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-3 text-xs text-gray-600">
                <h3 className="font-bold text-gray-900 text-base">সময়রেখা</h3>
                <div className="space-y-2.5">
                  <div>
                    <span className="text-gray-400 block">নিবন্ধন শুরু:</span>
                    <strong>{formatDhakaDateTime(olympiad.registrationStartDate)}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block">নিবন্ধন শেষ:</span>
                    <strong className="text-amber-600">
                      {formatDhakaDateTime(olympiad.registrationDeadline)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block">পরীক্ষা শুরু:</span>
                    <strong>{formatDhakaDateTime(olympiad.examStartDate)}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block">ফলাফল প্রকাশ:</span>
                    <strong>{formatDhakaDateTime(olympiad.resultsPublishDate)}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
