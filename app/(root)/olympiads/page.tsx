import { Metadata } from "next";
import Link from "next/link";
import { getPublishedOlympiads } from "@/lib/actions/olympiad.actions";
import { getSetting } from "@/lib/actions/setting.actions";
import { formatDhakaDateTime } from "@/lib/olympiad-lifecycle";
import { generateBreadcrumbSchema } from "@/lib/structured-data";
import {
  Trophy,
  Calendar,
  Clock,
  ArrowRight,
  Award,
  Users,
} from "lucide-react";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Academic Olympiads | Octal Technical Training Institute",
  description:
    "Explore upcoming and active academic Olympiads, national competitive exams, problem-solving contests, and student rankings at Octal Technical Training Institute.",
  keywords: [
    "Olympiad Bangladesh",
    "Math Olympiad",
    "Science Olympiad",
    "ICT Olympiad",
    "Octal Olympiad",
    "Academic Competitions",
  ],
  alternates: {
    canonical: "https://octal.edu.bd/olympiads",
  },
  openGraph: {
    title: "Academic Olympiads | Octal Technical Training Institute",
    description:
      "Explore upcoming and active academic Olympiads and student rankings.",
    url: "https://octal.edu.bd/olympiads",
    siteName: "Octal Technical Training Institute",
    type: "website",
  },
};

export default async function OlympiadsCatalogPage() {
  const [olympiads, settings] = await Promise.all([
    getPublishedOlympiads(),
    getSetting(),
  ]);

  const themeColor = settings?.theme || "#0055CE";

  const breadcrumbSchema = generateBreadcrumbSchema({
    items: [
      { name: "Home", url: "https://octal.edu.bd" },
      { name: "Olympiads", url: "https://octal.edu.bd/olympiads" },
    ],
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="min-h-screen bg-gray-50/50 py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Hero Heading */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
              style={{
                backgroundColor: `${themeColor}15`,
                color: themeColor,
              }}
            >
              <Trophy className="w-3.5 h-3.5" /> Academic Competitions
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
              Octal Olympiads
            </h1>
            <p className="text-gray-600 text-base md:text-lg">
              Compete, evaluate your analytical problem-solving skills, and gain
              official recognition through national academic competitions.
            </p>
          </div>

          {/* Cards Grid */}
          {olympiads.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-700">
                No active Olympiads at this moment
              </h3>
              <p className="text-sm text-gray-400 mt-1 max-w-md mx-auto">
                Check back soon or follow our official notices for upcoming
                competition announcements.
              </p>
              <Link
                href="/notices"
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-semibold transition"
                style={{ backgroundColor: themeColor }}
              >
                View Official Notices
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {olympiads.map((olympiad: any) => {
                const lifecycle = olympiad.lifecycle;
                const isOpen = lifecycle?.state === "registration_open";
                const isLive = lifecycle?.state === "exam_live";
                const isResultsOut = lifecycle?.state === "results_published";

                return (
                  <div
                    key={olympiad._id}
                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between group"
                  >
                    <div className="p-6 space-y-4">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-gray-100 text-gray-700">
                          {olympiad.category}
                        </span>

                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
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

                      {/* Title & Short Description */}
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 group-hover:text-primary transition line-clamp-1">
                          <Link href={`/olympiads/${olympiad.slug}`}>
                            {olympiad.title}
                          </Link>
                        </h2>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {olympiad.shortDescription}
                        </p>
                      </div>

                      {/* Target Classes */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {olympiad.targetClasses
                          ?.slice(0, 3)
                          .map((cls: string) => (
                            <span
                              key={cls}
                              className="text-[11px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-200"
                            >
                              {cls}
                            </span>
                          ))}
                        {olympiad.targetClasses?.length > 3 && (
                          <span className="text-[11px] text-gray-400 self-center">
                            +{olympiad.targetClasses.length - 3} more
                          </span>
                        )}
                      </div>

                      {/* Timings */}
                      <div className="space-y-1.5 pt-2 border-t border-gray-100 text-xs text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>
                            পরীক্ষার তারিখ:{" "}
                            <strong>
                              {formatDhakaDateTime(olympiad.examStartDate)}
                            </strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>সময়কাল: {olympiad.durationMinutes} মিনিট</span>
                        </div>

                        {isOpen && (
                          <div className="flex items-center gap-2 text-amber-600 font-medium">
                            <Users className="w-3.5 h-3.5" />
                            <span>
                              নিবন্ধন শেষ:{" "}
                              {formatDhakaDateTime(
                                olympiad.registrationDeadline,
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 bg-gray-50/60 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs text-gray-500 font-medium">
                        পূর্ণমান: {olympiad.totalMarks}
                      </span>

                      {isResultsOut ? (
                        <Link
                          href={`/olympiads/${olympiad.slug}/leaderboard`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                        >
                          <Award className="w-3.5 h-3.5" /> ফলাফল দেখুন
                        </Link>
                      ) : isOpen ? (
                        <Link
                          href={`/olympiads/${olympiad.slug}/register`}
                          className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-bold text-white transition hover:opacity-95"
                          style={{ backgroundColor: themeColor }}
                        >
                          নিবন্ধন করুন <ArrowRight className="w-3 h-3" />
                        </Link>
                      ) : isLive ? (
                        <Link
                          href={`/olympiads/${olympiad.slug}/exam`}
                          className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition"
                        >
                          পরীক্ষায় অংশ নিন
                        </Link>
                      ) : (
                        <Link
                          href={`/olympiads/${olympiad.slug}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-primary"
                        >
                          বিস্তারিত দেখুন <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
