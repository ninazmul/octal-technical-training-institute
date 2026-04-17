"use client";

import { useEffect, useMemo, useState } from "react";
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
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface DashboardClientProps {
  setting: ISettingSafe | null;
  admins: IAdmin[];
  courses: ICourseSafe[];
  registrations: SerializedRegistration[];
  trainers: SerializedTrainer[];
  complains: SerializedComplain[];
  dateFilter: DashboardDateFilterResolved;
}

type TrendPoint = {
  label: string;
  value: number;
};

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

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-BD", {
    maximumFractionDigits: 0,
  }).format(value);
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(value: string): string {
  const [year, month] = value.split("-");
  return new Date(Number(year), Number(month) - 1, 1).toLocaleString(
    "default",
    {
      month: "short",
      year: "numeric",
    },
  );
}

function buildMonthlySeries<T>(
  items: T[],
  getDate: (item: T) => string | null | undefined,
  getValue: (item: T) => number,
): TrendPoint[] {
  const bucket: Record<string, number> = {};

  items.forEach((item) => {
    const date = parseDateSafe(getDate(item));
    if (!date) return;
    const key = monthKey(date);
    bucket[key] = (bucket[key] ?? 0) + getValue(item);
  });

  return Object.entries(bucket)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => ({
      label: formatMonthLabel(key),
      value,
    }));
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

const PIE_COLORS = [
  "#6366f1",
  "#06b6d4",
  "#8b5cf6",
  "#f59e0b",
  "#22c55e",
  "#ef4444",
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
    <Card className="overflow-hidden border border-white/40 bg-white/70 shadow-lg backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-xl">
      <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500" />
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-500">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tracking-tight text-slate-900">
          {value}
        </p>
        {helper ? (
          <p className="mt-1 text-xs text-slate-500">{helper}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function formatTooltipValue(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value) || 0;
  return 0;
}

function ChartCard({
  title,
  children,
  subtitle,
}: {
  title: string;
  children: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <Card className="overflow-hidden border border-white/40 bg-white/70 shadow-lg backdrop-blur-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-base font-semibold text-slate-900">
          {title}
        </CardTitle>
        {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function MiniListCard({
  title,
  emptyText,
  children,
}: {
  title: string;
  emptyText: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden border border-white/40 bg-white/70 shadow-lg backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-slate-900">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {children ? (
          children
        ) : (
          <p className="text-sm text-slate-500">{emptyText}</p>
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

  useEffect(() => {
    setPreset(dateFilter.preset);
    setStartDate(dateFilter.startDateInput);
    setEndDate(dateFilter.endDateInput);
  }, [dateFilter.preset, dateFilter.startDateInput, dateFilter.endDateInput]);

  const updateFilterParams = (
    nextPreset: DashboardDatePreset,
    from?: string,
    to?: string,
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("preset", nextPreset);

    if (nextPreset === "custom") {
      if (from) params.set("startDate", from);
      if (to) params.set("endDate", to);
    } else {
      params.delete("startDate");
      params.delete("endDate");
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const handlePresetChange = (value: DashboardDatePreset) => {
    setPreset(value);

    if (value !== "custom") {
      updateFilterParams(value);
    }
  };

  const handleApplyFilter = () => {
    if (preset === "custom") {
      updateFilterParams("custom", startDate, endDate);
      return;
    }

    updateFilterParams(preset);
  };

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

  const registrationTrend = useMemo<TrendPoint[]>(() => {
    return buildMonthlySeries(
      registrations,
      (item) => item.createdAt,
      () => 1,
    );
  }, [registrations]);

  const revenueTrend = useMemo<TrendPoint[]>(() => {
    return buildMonthlySeries(
      registrations.filter((item) => item.paymentStatus === "Paid"),
      (item) => item.createdAt,
      (item) => item.paymentAmount ?? 0,
    );
  }, [registrations]);

  const paymentStatusData = useMemo(
    () => [
      { name: "Paid", value: metrics.paidCount },
      { name: "Pending", value: metrics.pendingPaymentsCount },
    ],
    [metrics.paidCount, metrics.pendingPaymentsCount],
  );

  const certificateStatusData = useMemo(
    () => [
      { name: "Certified", value: metrics.certifiedCount },
      { name: "Not Certified", value: metrics.notCertifiedCount },
    ],
    [metrics.certifiedCount, metrics.notCertifiedCount],
  );

  const recentRegistrations = useMemo(
    () => registrations.slice(0, 6),
    [registrations],
  );
  const recentTrainers = useMemo(() => trainers.slice(0, 6), [trainers]);
  const recentComplains = useMemo(() => complains.slice(0, 6), [complains]);

  const canApplyCustom =
    preset !== "custom" ||
    (startDate.trim().length > 0 && endDate.trim().length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="overflow-hidden rounded-3xl border border-white/50 bg-white/70 p-5 shadow-xl backdrop-blur-xl md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                {setting?.name ?? "Admin Dashboard"}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Live overview of registrations, trainers, complaints, payments,
                and certificates.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="min-w-[180px]">
                <p className="mb-1 text-xs font-medium text-slate-500">
                  Date Filter
                </p>
                <Select value={preset} onValueChange={handlePresetChange}>
                  <SelectTrigger className="bg-white/90">
                    <SelectValue placeholder="Select a range" />
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
                  <div>
                    <p className="mb-1 text-xs font-medium text-slate-500">
                      Start Date
                    </p>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-white/90"
                    />
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-medium text-slate-500">
                      End Date
                    </p>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-white/90"
                    />
                  </div>
                  <Button
                    onClick={handleApplyFilter}
                    disabled={!canApplyCustom}
                  >
                    Apply
                  </Button>
                </>
              ) : null}
            </div>
          </div>

          {!dateFilter.isValid && dateFilter.error ? (
            <p className="mt-3 text-sm font-medium text-red-600">
              {dateFilter.error}
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Trainer Applications" value={trainers.length} />
          <MetricCard title="Registrations" value={registrations.length} />
          <MetricCard title="Complaints" value={complains.length} />
          <MetricCard
            title="Revenue"
            value={`BDT ${formatCurrency(metrics.totalRevenue)}`}
          />
          <MetricCard title="Paid Registrations" value={metrics.paidCount} />
          <MetricCard
            title="Pending Payments"
            value={metrics.pendingPaymentsCount}
          />
          <MetricCard title="Certified" value={metrics.certifiedCount} />
          <MetricCard title="Not Certified" value={metrics.notCertifiedCount} />
          <MetricCard title="Admins" value={admins.length} />
          <MetricCard title="Courses" value={courses.length} />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="xl:col-span-2 space-y-4">
            <ChartCard
              title="Revenue Trend"
              subtitle="Monthly paid revenue in the selected range."
            >
              <div className="h-[320px]">
                {revenueTrend.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">
                    No revenue trend data in this range.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => {
                          const v = formatTooltipValue(value);
                          return [`BDT ${formatCurrency(v)}`, "Revenue"];
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name="Revenue"
                        stroke="#6366f1"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </ChartCard>

            <ChartCard
              title="Registration Trend"
              subtitle="Monthly registration volume in the selected range."
            >
              <div className="h-[320px]">
                {registrationTrend.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">
                    No registration trend data in this range.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={registrationTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="value"
                        name="Registrations"
                        fill="#0f172a"
                        radius={[10, 10, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </ChartCard>
          </div>

          <div className="space-y-4">
            <ChartCard title="Payment Status">
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentStatusData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {paymentStatusData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard title="Certificate Status">
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={certificateStatusData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {certificateStatusData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={PIE_COLORS[(index + 2) % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <MiniListCard
            title="Recent Trainers"
            emptyText="No trainer data for this range."
          >
            {recentTrainers.length === 0
              ? null
              : recentTrainers.map((item) => (
                  <div
                    key={item._id}
                    className="rounded-2xl border border-slate-100 bg-white/60 p-4"
                  >
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    <p className="text-sm text-slate-500">{item.email}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                ))}
          </MiniListCard>

          <MiniListCard
            title="Recent Registrations"
            emptyText="No registrations for this range."
          >
            {recentRegistrations.length === 0
              ? null
              : recentRegistrations.map((item) => (
                  <div
                    key={item._id}
                    className="rounded-2xl border border-slate-100 bg-white/60 p-4"
                  >
                    <p className="font-semibold text-slate-900">
                      {item.englishName ?? "Unnamed"}
                    </p>
                    <p className="text-sm text-slate-500">
                      {item.email ?? item.number ?? "-"}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                ))}
          </MiniListCard>

          <MiniListCard
            title="Recent Complaints"
            emptyText="No complaints for this range."
          >
            {recentComplains.length === 0
              ? null
              : recentComplains.map((item) => (
                  <div
                    key={item._id}
                    className="rounded-2xl border border-slate-100 bg-white/60 p-4"
                  >
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    <p className="line-clamp-2 text-sm text-slate-500">
                      {item.details}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                ))}
          </MiniListCard>
        </div>
      </div>
    </div>
  );
}
