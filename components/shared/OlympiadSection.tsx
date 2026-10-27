"use client";

import Link from "next/link";
import { formatDhakaDateTime } from "@/lib/olympiad-lifecycle";
import {
  Trophy,
  Calendar,
  Clock,
  ArrowRight,
  Users,
  Award,
  CheckCircle2,
} from "lucide-react";

interface OlympiadSectionProps {
  olympiads?: any[];
  themeColor?: string;
}

export default function OlympiadSection({
  olympiads = [],
  themeColor = "#0055CE",
}: OlympiadSectionProps) {
  if (!olympiads || olympiads.length === 0) return null;

  return (
    <section className="w-full py-16 px-6 md:px-12 bg-gray-50/80 border-t border-b border-gray-100">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2"
              style={{
                backgroundColor: `${themeColor}15`,
                color: themeColor,
              }}
            >
              <Trophy className="w-3.5 h-3.5" /> Academic Competitions
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              National & Regional Olympiads
            </h2>
            <p className="text-gray-600 text-sm md:text-base mt-2 max-w-2xl">
              Participate in scheduled competitive examinations, test your
              skills against the brightest minds across the country, and earn
              distinguished awards.
            </p>
          </div>

          <Link
            href="/olympiads"
            className="inline-flex items-center gap-2 font-semibold text-sm hover:underline"
            style={{ color: themeColor }}
          >
            সব অলিম্পিয়াড দেখুন <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {olympiads.slice(0, 6).map((olympiad) => {
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
                  {/* Category & Status Badge */}
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

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition line-clamp-1">
                      {olympiad.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {olympiad.shortDescription}
                    </p>
                  </div>

                  {/* Target Classes */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {olympiad.targetClasses?.slice(0, 3).map((cls: string) => (
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

                  {/* Schedule Details */}
                  <div className="space-y-1.5 pt-2 border-t border-gray-100 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>
                        পরীক্ষা:{" "}
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
                          {formatDhakaDateTime(olympiad.registrationDeadline)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
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
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white transition hover:opacity-95"
                      style={{ backgroundColor: themeColor }}
                    >
                      নিবন্ধন করুন <ArrowRight className="w-3 h-3" />
                    </Link>
                  ) : isLive ? (
                    <Link
                      href={`/olympiads/${olympiad.slug}/exam`}
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition"
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
      </div>
    </section>
  );
}
