import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublicLeaderboard } from "@/lib/actions/olympiad-exam.actions";
import { getSetting } from "@/lib/actions/setting.actions";
import { formatDhakaDateTime } from "@/lib/olympiad-lifecycle";
import {
  Trophy,
  Award,
  Medal,
  Calendar,
  ArrowLeft,
  Lock,
} from "lucide-react";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 60;

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Official Leaderboard & Results | Octal Technical Training Institute`,
    description: `View official merit rankings, participant scores, and distinctions for this academic Olympiad.`,
    alternates: {
      canonical: `https://octal.edu.bd/olympiads/${slug}/leaderboard`,
    },
  };
}

export default async function OlympiadLeaderboardPage({ params }: PageProps) {
  const { slug } = await params;
  const [data, settings] = await Promise.all([
    getPublicLeaderboard(slug),
    getSetting(),
  ]);

  const themeColor = settings?.theme || "#0055CE";

  if (!data) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-10 px-6 md:px-12">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back Link */}
        <Link
          href={`/olympiads/${slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-primary transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Olympiad Overview
        </Link>

        {/* Header Banner */}
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm text-center space-y-3">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
            style={{
              backgroundColor: `${themeColor}15`,
              color: themeColor,
            }}
          >
            <Trophy className="w-9 h-9" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Official Competition Rankings
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-1">
              {data.olympiadTitle || "Olympiad Results"}
            </h1>
          </div>

          {data.isPublic && (
            <p className="text-xs text-gray-500 max-w-lg mx-auto">
              Total Ranked Participants:{" "}
              <strong>{data.totalParticipants || 0}</strong>. Rankings are
              calculated using standard competition ranking based on official
              scores and authoritative submission timestamps.
            </p>
          )}
        </div>

        {/* Content */}
        {!data.isPublic ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-gray-200 shadow-sm space-y-4 max-w-lg mx-auto">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              Results Not Released Yet
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              Official evaluations are either in progress or scheduled for
              release. Please check back on the official results date:
            </p>
            {data.publishDate && (
              <div className="inline-block p-3 bg-amber-50 rounded-xl text-xs font-bold text-amber-800 border border-amber-200">
                Scheduled Release: {formatDhakaDateTime(data.publishDate)}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b text-gray-600 text-xs uppercase font-medium">
                  <tr>
                    <th className="py-4 px-6 text-center w-20">Rank</th>
                    <th className="py-4 px-6">Participant</th>
                    <th className="py-4 px-6">Institution</th>
                    <th className="py-4 px-6">Class</th>
                    <th className="py-4 px-6 text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.leaderboard?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-gray-400">
                        No published rankings available.
                      </td>
                    </tr>
                  ) : (
                    data.leaderboard.map((item: any) => {
                      const isTop1 = item.rank === 1;
                      const isTop2 = item.rank === 2;
                      const isTop3 = item.rank === 3;

                      return (
                        <tr
                          key={item._id}
                          className={`hover:bg-gray-50/70 transition ${
                            isTop1
                              ? "bg-amber-50/30"
                              : isTop2
                              ? "bg-slate-50/40"
                              : isTop3
                              ? "bg-amber-50/20"
                              : ""
                          }`}
                        >
                          <td className="py-4 px-6 text-center">
                            <span
                              className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                                isTop1
                                  ? "bg-amber-400 text-white shadow-sm ring-2 ring-amber-200"
                                  : isTop2
                                  ? "bg-slate-300 text-slate-800 ring-2 ring-slate-100"
                                  : isTop3
                                  ? "bg-amber-200 text-amber-900"
                                  : "text-gray-600 bg-gray-100"
                              }`}
                            >
                              {item.rank}
                            </span>
                          </td>

                          <td className="py-4 px-6">
                            <div className="font-bold text-gray-900 flex items-center gap-1.5">
                              {item.studentName}
                              {isTop1 && (
                                <Medal className="w-4 h-4 text-amber-500" />
                              )}
                            </div>
                          </td>

                          <td className="py-4 px-6 text-xs text-gray-600">
                            {item.studentInstitution || "N/A"}
                          </td>

                          <td className="py-4 px-6 text-xs text-gray-600">
                            {item.studentGrade || "N/A"}
                          </td>

                          <td className="py-4 px-6 text-right">
                            <div className="font-extrabold text-primary text-base">
                              {item.totalScore} / {item.maxScore}
                            </div>
                            <div className="text-[11px] text-gray-400">
                              {item.percentage}%
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
