import { Medal } from "lucide-react";

export interface OlympiadRankingRow {
  _id: string;
  rank: number;
  studentName: string;
  studentInstitution?: string | null;
  studentGrade?: string | null;
  totalScore: number;
  maxScore: number;
  percentage: number;
}

interface OlympiadRankingsTableProps {
  rows: OlympiadRankingRow[];
  limit?: number;
  emptyMessage?: string;
}

export default function OlympiadRankingsTable({
  rows,
  limit,
  emptyMessage = "No published rankings available.",
}: OlympiadRankingsTableProps) {
  const visibleRows = typeof limit === "number" ? rows.slice(0, limit) : rows;

  return (
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
          {visibleRows.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-12 text-gray-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            visibleRows.map((item) => {
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
                      {isTop1 && <Medal className="w-4 h-4 text-amber-500" />}
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
  );
}
