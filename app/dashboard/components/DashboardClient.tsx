"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ICourseSafe } from "@/lib/database/models/course.model";
import { IAdmin } from "@/lib/database/models/admin.model";
import { SerializedRegistration } from "@/lib/actions/registration.actions";
import { ISettingSafe } from "@/lib/database/models/setting.model";
import {
  DashboardDateFilterResolved,
  DashboardDatePreset,
} from "@/lib/dashboard-date-filter";
import { SerializedTrainer } from "@/lib/actions/trainer.actions";
import { SerializedComplain } from "@/lib/actions/complain.actions";

interface DashboardClientProps {
  setting: ISettingSafe | null;
  admins: IAdmin[];
  courses: ICourseSafe[];
  registrations: SerializedRegistration[];
  trainers: SerializedTrainer[];
  complains: SerializedComplain[];
  dateFilter: DashboardDateFilterResolved;
}

function parseDateSafe(value?: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDate(value?: string | null): string {
  const date = parseDateSafe(value);
  if (!date) return "-";
  return date.toLocaleString();
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(value: string): string {
  const [year, month] = value.split("-");
  return new Date(Number(year), Number(month) - 1, 1).toLocaleString("default", {
    month: "short",
    year: "numeric",
  });
}

const PRESET_OPTIONS: { value: DashboardDatePreset; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last7days", label: "Last 7 Days" },
  { value: "last30days", label: "Last 30 Days" },
  { value: "thisMonth", label: "This Month" },
  { value: "all", label: "All Time" },
  { value: "custom", label: "Custom Range" },
];

function MetricCard({
  title,
  value,
  helper,
}: {
  title: string;
  value: string | number;
  helper?: string;
}) {
  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
        {helper ? <p className="text-xs text-slate-500 mt-1">{helper}</p> : null}
      </CardContent>
    </Card>
  );
}

function TrendBars({
  title,
  data,
  emptyText,
}: {
  title: string;
  data: { label: string; value: number }[];
  emptyText: string;
}) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-slate-500">{emptyText}</p>
        ) : (
          <div className="space-y-3">
            {data.map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>{item.label}</span>
                  <span>{item.value}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-indigo-500"
                    style={{ width: `${Math.max((item.value / max) * 100, 4)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardClient({
  setting,
  admins,
  courses,
  registrations,
  trainers,
  complains,
  dateFilter,
}: DashboardClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [preset, setPreset] = useState<DashboardDatePreset>(dateFilter.preset);
  const [startDate, setStartDate] = useState(dateFilter.startDateInput);
  const [endDate, setEndDate] = useState(dateFilter.endDateInput);

  const metrics = useMemo(() => {
    const paid = registrations.filter((item) => item.paymentStatus === "Paid");
    const pendingPayments = registrations.filter(
      (item) => item.paymentStatus === "Pending",
    );
    const certified = registrations.filter(
      (item) => item.certificateStatus === "Certified",
    );
    const notCertified = registrations.filter(
      (item) => item.certificateStatus !== "Certified",
    );
    const totalRevenue = paid.reduce(
      (sum, item) => sum + (item.paymentAmount ?? 0),
      0,
    );

    return {
      paidCount: paid.length,
      pendingPaymentsCount: pendingPayments.length,
      certifiedCount: certified.length,
      notCertifiedCount: notCertified.length,
      totalRevenue,
    };
  }, [registrations]);

  const registrationTrend = useMemo(() => {
    const bucket: Record<string, number> = {};
    registrations.forEach((item) => {
      const date = parseDateSafe(item.createdAt);
      if (!date) return;
      const key = monthKey(date);
      bucket[key] = (bucket[key] ?? 0) + 1;
    });
    return Object.entries(bucket)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => ({ label: formatMonthLabel(key), value }));
  }, [registrations]);

  const revenueTrend = useMemo(() => {
    const bucket: Record<string, number> = {};
    registrations.forEach((item) => {
      if (item.paymentStatus !== "Paid") return;
      const date = parseDateSafe(item.createdAt);
      if (!date) return;
      const key = monthKey(date);
      bucket[key] = (bucket[key] ?? 0) + (item.paymentAmount ?? 0);
    });
    return Object.entries(bucket)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => ({ label: formatMonthLabel(key), value }));
  }, [registrations]);

  const recentRegistrations = useMemo(() => registrations.slice(0, 6), [registrations]);
  const recentTrainers = useMemo(() => trainers.slice(0, 6), [trainers]);
  const recentComplains = useMemo(() => complains.slice(0, 6), [complains]);

  const updateFilterParams = (nextPreset: DashboardDatePreset, from?: string, to?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("preset", nextPreset);
    if (nextPreset === "custom" && from && to) {
      params.set("startDate", from);
      params.set("endDate", to);
    } else {
      params.delete("startDate");
      params.delete("endDate");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleApplyFilter = () => {
    if (preset === "custom") {
      updateFilterParams("custom", startDate, endDate);
      return;
    }
    updateFilterParams(preset);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {setting?.name ?? "Admin Dashboard"}
            </h1>
            <p className="text-sm text-slate-500">
              Showing data by `createdAt` with today as default.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="min-w-[180px]">
              <p className="mb-1 text-xs text-slate-500">Date Filter</p>
              <Select value={preset} onValueChange={(value) => setPreset(value as DashboardDatePreset)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRESET_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {preset === "custom" ? (
              <>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </>
            ) : null}
            <Button onClick={handleApplyFilter}>Apply</Button>
          </div>
        </div>
        {!dateFilter.isValid && dateFilter.error ? (
          <p className="mt-3 text-sm text-red-600">{dateFilter.error}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Trainer Applications" value={trainers.length} />
        <MetricCard title="Registrations" value={registrations.length} />
        <MetricCard title="Complaints" value={complains.length} />
        <MetricCard title="Revenue" value={`BDT ${metrics.totalRevenue.toLocaleString()}`} />
        <MetricCard title="Paid Registrations" value={metrics.paidCount} />
        <MetricCard title="Pending Payments" value={metrics.pendingPaymentsCount} />
        <MetricCard title="Certified" value={metrics.certifiedCount} />
        <MetricCard title="Not Certified" value={metrics.notCertifiedCount} />
        <MetricCard title="Admins" value={admins.length} />
        <MetricCard title="Courses" value={courses.length} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TrendBars
          title="Registration Trend"
          data={registrationTrend}
          emptyText="No registration trend data in this range."
        />
        <TrendBars
          title="Revenue Trend"
          data={revenueTrend}
          emptyText="No revenue trend data in this range."
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Trainers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentTrainers.length === 0 ? (
              <p className="text-sm text-slate-500">No trainer data for this range.</p>
            ) : (
              recentTrainers.map((item) => (
                <div key={item._id} className="rounded-lg border border-slate-100 p-3">
                  <p className="font-medium text-slate-900">{item.name}</p>
                  <p className="text-sm text-slate-500">{item.email}</p>
                  <p className="text-xs text-slate-400">{formatDate(item.createdAt)}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Registrations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentRegistrations.length === 0 ? (
              <p className="text-sm text-slate-500">No registrations for this range.</p>
            ) : (
              recentRegistrations.map((item) => (
                <div key={item._id} className="rounded-lg border border-slate-100 p-3">
                  <p className="font-medium text-slate-900">{item.englishName ?? "Unnamed"}</p>
                  <p className="text-sm text-slate-500">{item.email ?? item.number ?? "-"}</p>
                  <p className="text-xs text-slate-400">{formatDate(item.createdAt)}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Complaints</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentComplains.length === 0 ? (
              <p className="text-sm text-slate-500">No complaints for this range.</p>
            ) : (
              recentComplains.map((item) => (
                <div key={item._id} className="rounded-lg border border-slate-100 p-3">
                  <p className="font-medium text-slate-900">{item.name}</p>
                  <p className="text-sm text-slate-500 line-clamp-2">{item.details}</p>
                  <p className="text-xs text-slate-400">{formatDate(item.createdAt)}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
