import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublicLeaderboard } from "@/lib/actions/olympiad-exam.actions";
import { getSetting } from "@/lib/actions/setting.actions";
import { formatDhakaDateTime } from "@/lib/olympiad-lifecycle";
import OlympiadRankingsTable from "@/components/shared/OlympiadRankingsTable";
import { Trophy, ArrowLeft, Lock } from "lucide-react";

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
            <OlympiadRankingsTable rows={data.leaderboard || []} />
          </div>
        )}
      </div>
    </div>
  );
}
