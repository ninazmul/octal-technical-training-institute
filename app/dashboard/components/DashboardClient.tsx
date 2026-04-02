"use client";

import React, { useEffect, useMemo, useState } from "react";
import Loader from "@/components/shared/Loader";
import { ICourseSafe } from "@/lib/database/models/course.model";
import { IAdmin } from "@/lib/database/models/admin.model";
import { SerializedRegistration } from "@/lib/actions/registration.actions";
import { ISettingSafe } from "@/lib/database/models/setting.model";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/* -------------------- Props -------------------- */
interface DashboardClientProps {
  setting: ISettingSafe | null;
  admins: IAdmin[];
  courses: ICourseSafe[];
  registrations: SerializedRegistration[];
}

/* -------------------- Types -------------------- */
type Timeframe = "3m" | "6m" | "12m" | "ytd" | "all";

/* -------------------- Utilities -------------------- */
function parseDateSafe(value?: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function getCourseEndDate(
  startDateStr?: string | null,
  durationStr?: string | null,
): Date | null {
  const start = parseDateSafe(startDateStr ?? null);
  if (!start) return null;
  if (!durationStr) return start;

  const match = durationStr.match(/(\d+)\s*(day|week|month|year)s?/i);
  if (!match) return start;

  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  let days = 0;
  switch (unit) {
    case "day":
      days = value;
      break;
    case "week":
      days = value * 7;
      break;
    case "month":
      days = value * 30;
      break;
    case "year":
      days = value * 365;
      break;
    default:
      days = value;
  }
  return addDays(start, days);
}

function monthKey(d: Date): string {
  return d.toLocaleString("default", { month: "short", year: "numeric" });
}

/* ---------------- PieChart (fixed size + inline colors) ---------------- */
interface PieChartProps {
  values: number[]; // raw values (counts)
  colors: string[]; // colors for each slice
  labels?: string[]; // labels for legend
  size?: number;
  backgroundColor?: string;
}

function PieChart({
  values,
  colors,
  labels,
  size = 160,
  backgroundColor = "#e5e7eb",
}: PieChartProps) {
  const center = size / 2;
  const radius = center - 6;

  const totalValue = values.reduce((s, v) => s + v, 0);

  // Case: all values are zero
  if (totalValue === 0) {
    return (
      <div className="flex items-center gap-4">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={center} cy={center} r={radius} fill={backgroundColor} />
        </svg>
        {labels && (
          <div className="flex flex-col text-sm">
            {labels.map((label, i) => (
              <div key={i} className="flex items-center gap-2">
                <span
                  style={{
                    width: 15,
                    height: 15,
                    backgroundColor: colors[i % colors.length],
                    display: "inline-block",
                    borderRadius: 3,
                  }}
                />
                <span>{label}: 0</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Case: only one non-zero value → fill entire circle
  const nonZeroValues = values.filter((v) => v > 0);
  if (nonZeroValues.length === 1) {
    const idx = values.findIndex((v) => v > 0);
    return (
      <div className="flex flex-wrap items-center gap-4">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill={colors[idx % colors.length]}
          />
        </svg>

        {labels && (
          <div className="flex flex-wrap lg:flex-col gap-2 text-sm">
            {labels.map((label, i) => (
              <div key={i} className="flex items-center gap-2">
                <span
                  style={{
                    width: 12,
                    height: 12,
                    backgroundColor: colors[i % colors.length],
                    display: "inline-block",
                    borderRadius: 3,
                  }}
                />
                <span>
                  {label}: {values[i]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Case: multiple values → proportional slices
  let cumulativeAngle = 0;

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={center} cy={center} r={radius} fill={backgroundColor} />

        {values.map((v, i) => {
          if (v <= 0) return null;

          const sliceAngle = (v / totalValue) * 2 * Math.PI;
          const startAngle = cumulativeAngle;
          const endAngle = cumulativeAngle + sliceAngle;
          cumulativeAngle = endAngle;

          const x1 = center + radius * Math.cos(startAngle - Math.PI / 2);
          const y1 = center + radius * Math.sin(startAngle - Math.PI / 2);
          const x2 = center + radius * Math.cos(endAngle - Math.PI / 2);
          const y2 = center + radius * Math.sin(endAngle - Math.PI / 2);

          const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;

          const pathData = `
            M ${center} ${center}
            L ${x1} ${y1}
            A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
            Z
          `;

          return (
            <path
              key={i}
              d={pathData}
              fill={colors[i % colors.length]}
              stroke="white"
              strokeWidth={1}
            />
          );
        })}
      </svg>

      {labels && (
        <div className="flex flex-col text-sm">
          {labels.map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <span
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: colors[i % colors.length],
                  display: "inline-block",
                  borderRadius: 3,
                }}
              />
              <span>
                {label}: {values[i]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- BarChart (fixed container height + inline colors) ---------------- */
function BarChart({
  labels,
  values,
  color = "#3b82f6",
}: {
  labels: string[];
  values: number[];
  color?: string;
}) {
  const max = Math.max(...values, 1);
  const containerHeightPx = 180; // fixed pixel height for the chart area

  return (
    <div className="w-full">
      <div
        className="flex items-end gap-2"
        style={{ height: containerHeightPx, alignItems: "flex-end" }}
      >
        {values.map((v, i) => {
          const rawPercent = Math.round((v / max) * 100);
          const percent = Math.max(rawPercent, 4); // ensure visible min
          const barColor = Array.isArray(color)
            ? color[i % color.length]
            : color;

          // compute pixel height from percent and container height
          const barHeightPx = Math.max(
            Math.round((percent / 100) * containerHeightPx),
            6,
          );

          return (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div
                title={`${labels[i]}: ${v}`}
                style={{
                  height: barHeightPx,
                  minHeight: 6,
                  width: "100%",
                  display: "flex",
                  alignItems: "flex-end",
                }}
                className="w-full rounded-t-md"
              >
                <div
                  style={{
                    backgroundColor: barColor,
                    height: "100%",
                    borderRadius: 8,
                    width: "100%",
                    boxShadow: "inset 0 -6px 8px rgba(0,0,0,0.06)",
                    transition:
                      "height 300ms ease, background-color 200ms ease",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-gray-600">
        {labels.slice(0, 12).map((l, i) => (
          <div key={i} className="truncate">
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------- Hook: useDashboardData -------------------- */

function useDashboardData(
  courses: ICourseSafe[],
  registrations: SerializedRegistration[],
  timeframe: Timeframe,
) {
  // Normalize registrations once (parse createdAt)
  const regWithDate = useMemo(
    () =>
      registrations.map((r) => ({
        ...r,
        createdAtDate: parseDateSafe(r.createdAt ?? null),
      })),
    [registrations],
  );

  // cutoff date based on timeframe
  const cutoffDate = useMemo(() => {
    const d = new Date();
    switch (timeframe) {
      case "3m":
        d.setMonth(d.getMonth() - 3);
        break;
      case "6m":
        d.setMonth(d.getMonth() - 6);
        break;
      case "12m":
        d.setMonth(d.getMonth() - 12);
        break;
      case "ytd":
        d.setMonth(0);
        d.setDate(1);
        break;
      case "all":
      default:
        d.setFullYear(1970);
    }
    // zero out time for consistent comparisons
    d.setHours(0, 0, 0, 0);
    return d;
  }, [timeframe]);

  // Aggregate monthly registrations & revenue in a single pass
  const { monthlyRegistrationsMap, monthlyRevenueMap } = useMemo(() => {
    const regMap: Record<string, number> = {};
    const revMap: Record<string, number> = {};

    for (const r of regWithDate) {
      const d = r.createdAtDate;
      if (!d) continue;
      if (d < cutoffDate) continue;
      const key = monthKey(d);
      regMap[key] = (regMap[key] || 0) + 1;
      if (r.paymentStatus === "Paid" && r.paymentAmount) {
        revMap[key] = (revMap[key] || 0) + r.paymentAmount;
      }
    }

    const sortKeys = (map: Record<string, number>) =>
      Object.keys(map)
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
        .reduce((acc: Record<string, number>, k) => {
          acc[k] = map[k];
          return acc;
        }, {});

    return {
      monthlyRegistrationsMap: sortKeys(regMap),
      monthlyRevenueMap: sortKeys(revMap),
    };
  }, [regWithDate, cutoffDate]);

  // Total revenue and revenue by course (single pass)
  const { totalRevenue, revenueByCourseMap, recentPaidRegistrations } =
    useMemo(() => {
      let total = 0;
      const revMap: Record<string, number> = {};
      const recentPaid: SerializedRegistration[] = [];

      for (const r of regWithDate) {
        if (r.paymentStatus === "Paid" && r.paymentAmount) {
          total += r.paymentAmount;
          const cid =
            typeof r.course === "string"
              ? r.course
              : (r.course as ICourseSafe)?._id
                ? String((r.course as ICourseSafe)._id)
                : "";
          if (cid) revMap[cid] = (revMap[cid] || 0) + r.paymentAmount;
          recentPaid.push(r);
        }
      }

      recentPaid.sort((a, b) => {
        const da = parseDateSafe(a.createdAt ?? null) ?? new Date(0);
        const db = parseDateSafe(b.createdAt ?? null) ?? new Date(0);
        return db.getTime() - da.getTime();
      });

      return {
        totalRevenue: total,
        revenueByCourseMap: revMap,
        recentPaidRegistrations: recentPaid.slice(0, 10),
      };
    }, [regWithDate]);

  // Course classification (upcoming, ongoing, completed)
  const now = useMemo(() => new Date(), []);
  const { upcomingCourses, ongoingCourses, completedCourses } = useMemo(() => {
    const upcoming: ICourseSafe[] = [];
    const ongoing: ICourseSafe[] = [];
    const completed: ICourseSafe[] = [];

    for (const c of courses) {
      const start = parseDateSafe(c.courseStartDate ?? null);
      const end = getCourseEndDate(
        c.courseStartDate ?? null,
        c.duration ?? null,
      );

      if (!start) {
        upcoming.push(c);
        continue;
      }

      if (start > now) upcoming.push(c);
      else if (start <= now && end && end >= now) ongoing.push(c);
      else if (end && end < now) completed.push(c);
      else upcoming.push(c);
    }

    return {
      upcomingCourses: upcoming,
      ongoingCourses: ongoing,
      completedCourses: completed,
    };
  }, [courses, now]);

  // Course sales and registrations aggregated from revenueByCourseMap and regWithDate
  const courseSales = useMemo(() => {
    // Build registration counts per course in one pass
    const regsCountMap: Record<string, number> = {};
    for (const r of regWithDate) {
      if (r.paymentStatus !== "Paid") continue;
      const cid =
        typeof r.course === "string"
          ? r.course
          : (r.course as ICourseSafe)?._id
            ? String((r.course as ICourseSafe)._id)
            : "";
      if (!cid) continue;
      regsCountMap[cid] = (regsCountMap[cid] || 0) + 1;
    }

    return courses.map((c) => ({
      course: c,
      sales: revenueByCourseMap[c._id] || 0,
      registrations: regsCountMap[c._id] || 0,
    }));
  }, [courses, revenueByCourseMap, regWithDate]);

  const mostSellingCourses = useMemo(
    () => [...courseSales].sort((a, b) => b.sales - a.sales).slice(0, 5),
    [courseSales],
  );

  return {
    cutoffDate,
    monthlyRegistrationsMap,
    monthlyRevenueMap,
    totalRevenue,
    courseSales,
    mostSellingCourses,
    recentPaidRegistrations,
    upcomingCourses,
    ongoingCourses,
    completedCourses,
  };
}

/* -------------------- Component -------------------- */

export default function DashboardClient({
  setting,
  admins,
  courses,
  registrations,
}: DashboardClientProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [timeframe, setTimeframe] = useState<Timeframe>("12m");

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(t);
  }, []);

  const {
    monthlyRegistrationsMap,
    monthlyRevenueMap,
    totalRevenue,
    mostSellingCourses,
    recentPaidRegistrations,
    upcomingCourses,
    ongoingCourses,
    completedCourses,
  } = useDashboardData(courses, registrations, timeframe);

  const pieColors = ["#f59e0b", "#10b981", "#3b82f6"]; // amber, green, blue
  const barColor = "#6366f1"; // indigo

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-10 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">
          {setting?.name ?? "Dashboard"}
        </h1>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Timeframe:</span>
          <Select
            value={timeframe}
            onValueChange={(val) => setTimeframe(val as Timeframe)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3m">Last 3 months</SelectItem>
              <SelectItem value="6m">Last 6 months</SelectItem>
              <SelectItem value="12m">Last 12 months</SelectItem>
              <SelectItem value="ytd">Year to date</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <Card className="bg-teal-50 border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-sm text-gray-600">Admins</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-2xl font-bold text-teal-600">
            {admins.length}
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-sm text-gray-600">Courses</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-2xl font-bold text-blue-600">
            {courses.length}
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-sm text-gray-600">
              Ongoing Courses
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center text-2xl font-bold text-green-600">
            {ongoingCourses.length}
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-sm text-gray-600">
              Upcoming Courses
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center text-2xl font-bold text-yellow-500">
            {upcomingCourses.length}
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-sm text-gray-600">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center text-2xl font-bold text-purple-600">
            BDT {totalRevenue.toLocaleString()}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle>Course Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-6 items-center justify-center">
            <PieChart
              values={[
                upcomingCourses.length,
                ongoingCourses.length,
                completedCourses.length,
              ]}
              colors={pieColors}
              labels={["Upcoming", "Ongoing", "Completed"]}
              size={160}
            />
          </CardContent>
        </Card>

        <Card className="shadow-md border-0 lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(monthlyRegistrationsMap).length ? (
              <BarChart
                labels={Object.keys(monthlyRegistrationsMap)}
                values={Object.values(monthlyRegistrationsMap)}
                color={barColor}
              />
            ) : (
              <div className="text-gray-500 text-sm text-center">
                No registration data for selected timeframe.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md border-0 mt-8">
        <CardHeader>
          <CardTitle>Monthly Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(monthlyRevenueMap).length ? (
            <BarChart
              labels={Object.keys(monthlyRevenueMap)}
              values={Object.values(monthlyRevenueMap)}
              color={barColor}
            />
          ) : (
            <div className="text-gray-500 text-sm text-center">
              No revenue data for selected timeframe.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent & Top Selling */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle>Recent Paid Registrations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentPaidRegistrations.length ? (
              recentPaidRegistrations.map((r, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center py-2 border-b last:border-b-0"
                >
                  <div>
                    <div className="font-medium">
                      {r.englishName ?? "Anonymous"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {r.email ?? r.number ?? ""}
                    </div>
                  </div>
                  <div className="text-sm font-semibold">
                    BDT {r.paymentAmount?.toLocaleString() ?? 0}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-sm text-center">
                No recent paid registrations.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle>Top Selling Courses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {mostSellingCourses.length ? (
              mostSellingCourses.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center py-2 border-b last:border-b-0"
                >
                  <div>
                    <div className="font-medium">{item.course.title}</div>
                    <div className="text-xs text-gray-500">
                      {item.course._id}
                    </div>
                  </div>
                  <div className="text-sm text-right">
                    <div className="font-semibold">
                      BDT {item.sales.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.registrations} registrations
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-sm text-center">
                No courses sold yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
