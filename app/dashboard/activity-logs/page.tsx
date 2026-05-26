import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserEmailById } from "@/lib/actions/user.actions";
import { getAdminRole, isAdmin } from "@/lib/actions/admin.actions";
import { getActivityLogs, getActivityStats } from "@/lib/actions";
import ActivityLogTable from "../components/ActivityLogTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  History,
  UserCheck,
  TrendingUp,
  PlusCircle,
  Edit2,
  Trash2,
  Settings,
} from "lucide-react";

export default async function ActivityLogsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  // 1. Authenticate user
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;
  const email = await getUserEmailById(userId);
  const adminStatus = await isAdmin(email);
  const role = await getAdminRole(email);

  // 2. Authorization check
  if (!adminStatus || role !== "Admin") {
    redirect("/dashboard");
  }

  // 3. Resolve search params
  const parsedSearchParams = (await searchParams) ?? {};
  const page = Number(parsedSearchParams.page || 1);
  const search = (parsedSearchParams.search as string) || "";
  const action = (parsedSearchParams.action as string) || "all";
  const target = (parsedSearchParams.target as string) || "all";

  // 4. Fetch logs and statistics on server
  const [logsData, stats] = await Promise.all([
    getActivityLogs({ page, limit: 15, search, action, target }),
    getActivityStats(),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50 p-4 md:p-6 space-y-6">
      {/* Header Panel */}
      <div className="overflow-hidden rounded-3xl border border-white/50 bg-white/70 p-5 shadow-xl backdrop-blur-xl md:p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            System Activity Logs
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Audit trail of administrative actions showing which administrator modified what, when, and how.
          </p>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Actions Card */}
        <Card className="overflow-hidden border border-white/40 bg-white/70 shadow-lg backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-xl">
          <div className="h-1 w-full bg-indigo-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Total Logged Actions
            </CardTitle>
            <History className="w-5 h-5 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-950">{stats.totalLogs}</p>
            <p className="text-xs text-slate-400 mt-1">Recorded action history</p>
          </CardContent>
        </Card>

        {/* Active Admins Card */}
        <Card className="overflow-hidden border border-white/40 bg-white/70 shadow-lg backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-xl">
          <div className="h-1 w-full bg-violet-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Active Operators
            </CardTitle>
            <UserCheck className="w-5 h-5 text-violet-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-950">{stats.activeAdminsCount}</p>
            <p className="text-xs text-slate-400 mt-1">Admins/Moderators active</p>
          </CardContent>
        </Card>

        {/* Top Performer Card */}
        <Card className="overflow-hidden border border-white/40 bg-white/70 shadow-lg backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-xl">
          <div className="h-1 w-full bg-cyan-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Most Active Admin
            </CardTitle>
            <TrendingUp className="w-5 h-5 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold text-slate-950 truncate">
              {stats.topAdmin ? stats.topAdmin.name : "N/A"}
            </p>
            <p className="text-xs text-slate-400 mt-1 truncate">
              {stats.topAdmin ? `${stats.topAdmin.count} actions performed` : "No actions logged"}
            </p>
          </CardContent>
        </Card>

        {/* Actions Breakdown Card */}
        <Card className="overflow-hidden border border-white/40 bg-white/70 shadow-lg backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-xl">
          <div className="h-1 w-full bg-emerald-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Action Breakdown
            </CardTitle>
            <Settings className="w-5 h-5 text-emerald-500" />
          </CardHeader>
          <CardContent className="flex items-center gap-4 text-xs font-semibold mt-1">
            <div className="flex items-center gap-1 text-green-600">
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{stats.actions.CREATE}</span>
            </div>
            <div className="flex items-center gap-1 text-blue-600">
              <Edit2 className="w-3.5 h-3.5" />
              <span>{stats.actions.UPDATE}</span>
            </div>
            <div className="flex items-center gap-1 text-red-600">
              <Trash2 className="w-3.5 h-3.5" />
              <span>{stats.actions.DELETE}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Container */}
      <div className="overflow-hidden rounded-3xl border border-white/50 bg-white/70 p-5 shadow-xl backdrop-blur-xl md:p-6">
        <ActivityLogTable
          logs={logsData.logs}
          totalPages={logsData.totalPages}
          currentPage={logsData.currentPage}
        />
      </div>
    </div>
  );
}
