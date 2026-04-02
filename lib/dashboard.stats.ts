// lib/dashboard.stats.ts
import Course from "@/lib/database/models/course.model";
import Registration from "@/lib/database/models/registration.model";
import { Types } from "mongoose";

/**
 * Local types (do not change model files)
 * These mirror your model interfaces but are declared here so we can
 * safely cast runtime results without relying on model generics.
 */
export type MonthlyCount = {
  month: string;
  count: number;
  revenue?: number;
};

export type CourseSales = {
  courseId: string;
  title: string;
  registrations: number;
  revenue: number;
  seats?: number;
  seatsFilled?: number;
};

export type DashboardStats = {
  totals: {
    courses: number;
    registrations: number;
    paidRegistrations: number;
    pendingRegistrations: number;
    totalRevenue: number;
  };
  registrationBreakdown: {
    byPaymentStatus: Record<string, number>;
    byPaymentMethod: Record<string, number>;
    byGender: Record<string, number>;
    byCertificateStatus: Record<string, number>;
  };
  monthly: {
    registrations: MonthlyCount[];
    revenue: MonthlyCount[];
  };
  courseStats: {
    upcoming: number;
    ongoing: number;
    completed: number;
    byCourse: CourseSales[];
    topCourses: CourseSales[];
  };
  recent: {
    recentPaidRegistrations: {
      _id: string;
      englishName?: string;
      email?: string;
      phone?: string;
      paymentAmount: number;
      paymentStatus: string;
      createdAt: string;
      courseId?: string;
      courseTitle?: string;
    }[];
  };
  raw?: {
    registrationsCount?: number;
    coursesCount?: number;
  };
};

/* -------------------- Helpers -------------------- */

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

/* -------------------- Main function -------------------- */

/**
 * Compute dashboard statistics.
 *
 * Important: we do not change model files. Some mongoose helpers may be untyped
 * in your environment. To avoid "Untyped function calls may not accept type arguments"
 * we do not call model functions with type arguments. Instead we cast results
 * to local types after the query.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  // Use aggregation on Registration to compute many metrics in one DB roundtrip.
  // The aggregate result is untyped at runtime; cast later.
  const registrationAggResult = await Registration.aggregate([
    {
      $facet: {
        totals: [
          {
            $group: {
              _id: null,
              totalRegistrations: { $sum: 1 },
              paidRegistrations: {
                $sum: { $cond: [{ $eq: ["$paymentStatus", "Paid"] }, 1, 0] },
              },
              pendingRegistrations: {
                $sum: { $cond: [{ $eq: ["$paymentStatus", "Pending"] }, 1, 0] },
              },
              totalRevenue: {
                $sum: {
                  $cond: [
                    { $eq: ["$paymentStatus", "Paid"] },
                    { $ifNull: ["$paymentAmount", 0] },
                    0,
                  ],
                },
              },
            },
          },
        ],
        byPaymentStatus: [
          {
            $group: {
              _id: "$paymentStatus",
              count: { $sum: 1 },
            },
          },
        ],
        byPaymentMethod: [
          {
            $group: {
              _id: "$paymentMethod",
              count: { $sum: 1 },
            },
          },
        ],
        byGender: [
          {
            $group: {
              _id: "$gender",
              count: { $sum: 1 },
            },
          },
        ],
        byCertificateStatus: [
          {
            $group: {
              _id: "$certificateStatus",
              count: { $sum: 1 },
            },
          },
        ],
        revenueByCourse: [
          { $match: { paymentStatus: "Paid" } },
          {
            $group: {
              _id: "$course",
              revenue: { $sum: { $ifNull: ["$paymentAmount", 0] } },
              registrations: { $sum: 1 },
            },
          },
        ],
        monthly: [
          { $match: { createdAt: { $exists: true } } },
          {
            $project: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              paymentAmount: { $ifNull: ["$paymentAmount", 0] },
            },
          },
          {
            $group: {
              _id: { year: "$year", month: "$month" },
              registrations: { $sum: 1 },
              revenue: { $sum: "$paymentAmount" },
            },
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } },
        ],
        recentPaid: [
          { $match: { paymentStatus: "Paid" } },
          { $sort: { createdAt: -1 } },
          { $limit: 10 },
          {
            $project: {
              englishName: 1,
              email: 1,
              phone: "$number",
              paymentAmount: 1,
              paymentStatus: 1,
              createdAt: 1,
              course: 1,
            },
          },
        ],
      },
    },
  ]);

  // registrationAggResult is an array with one element (the facet object)
  const agg = (registrationAggResult && registrationAggResult[0]) || {};

  // Safely extract totals
  const totalsAgg = (agg.totals && agg.totals[0]) || {
    totalRegistrations: 0,
    paidRegistrations: 0,
    pendingRegistrations: 0,
    totalRevenue: 0,
  };

  // Load courses. Course.find().lean() may be untyped in your environment;
  // cast the result to a local shape after fetching.
  const rawCourses = await Course.find().lean().exec();
  // rawCourses is unknown at compile time; cast to a safe local shape
  type RawCourse = {
    _id: Types.ObjectId | string;
    title?: string;
    seats?: number;
    courseStartDate?: string;
    duration?: string;
  };
  const courses = rawCourses as unknown as RawCourse[];

  // Build a map of revenue/registrations per course from aggregation
  const revenueByCourseMap: Record<
    string,
    { revenue: number; registrations: number }
  > = {};
  const revenueByCourseRaw = (agg.revenueByCourse || []) as Array<{
    _id?: Types.ObjectId | string;
    revenue?: number;
    registrations?: number;
  }>;
  for (const r of revenueByCourseRaw) {
    const idStr = r._id ? String(r._id) : "";
    revenueByCourseMap[idStr] = {
      revenue: r.revenue ?? 0,
      registrations: r.registrations ?? 0,
    };
  }

  // Compute course status counts and per-course sales
  const now = new Date();
  let upcoming = 0;
  let ongoing = 0;
  let completed = 0;

  const byCourse: CourseSales[] = courses.map((c) => {
    const idStr = String(c._id ?? "");
    const start = parseDateSafe(c.courseStartDate ?? null);
    const end = getCourseEndDate(c.courseStartDate ?? null, c.duration ?? null);

    if (!start) {
      upcoming += 1;
    } else if (start > now) {
      upcoming += 1;
    } else if (start <= now && end && end >= now) {
      ongoing += 1;
    } else if (end && end < now) {
      completed += 1;
    } else {
      upcoming += 1;
    }

    const sales = revenueByCourseMap[idStr] || { revenue: 0, registrations: 0 };
    const seats = typeof c.seats === "number" ? c.seats : undefined;
    const seatsFilled =
      seats && seats > 0 ? Math.min(sales.registrations, seats) : undefined;

    return {
      courseId: idStr,
      title: c.title ?? "Untitled Course",
      registrations: sales.registrations,
      revenue: sales.revenue,
      seats,
      seatsFilled,
    };
  });

  // Sort by revenue descending
  byCourse.sort((a, b) => b.revenue - a.revenue);
  const topCourses = byCourse.slice(0, 5);

  // Monthly arrays from aggregation
  const monthlyRaw = (agg.monthly || []) as Array<{
    _id: { year: number; month: number };
    registrations?: number;
    revenue?: number;
  }>;
  const monthlyRegistrations: MonthlyCount[] = monthlyRaw.map((m) => {
    const d = new Date(m._id.year, m._id.month - 1, 1);
    return {
      month: monthKey(d),
      count: m.registrations ?? 0,
      revenue: m.revenue ?? 0,
    };
  });

  // Recent paid registrations (from facet). Enrich with course title lookup.
  const recentRaw = (agg.recentPaid || []) as Array<{
    _id?: Types.ObjectId | string;
    englishName?: string;
    email?: string;
    phone?: string;
    paymentAmount?: number;
    paymentStatus?: string;
    createdAt?: Date;
    course?: Types.ObjectId | string;
  }>;

  const courseTitleMap: Record<string, string> = {};
  for (const c of courses) {
    courseTitleMap[String(c._id)] = c.title ?? "Untitled Course";
  }

  const recentPaid = recentRaw.map((r) => ({
    _id: r._id ? String(r._id) : "",
    englishName: r.englishName,
    email: r.email,
    phone: r.phone,
    paymentAmount: r.paymentAmount ?? 0,
    paymentStatus: r.paymentStatus ?? "Unknown",
    createdAt: r.createdAt ? r.createdAt.toISOString() : "",
    courseId: r.course ? String(r.course) : undefined,
    courseTitle: r.course ? courseTitleMap[String(r.course)] : undefined,
  }));

  // Helper to safely reduce facet arrays returned by aggregation
  function reduceFacet(facet: unknown): Record<string, number> {
    const arr = (Array.isArray(facet) ? facet : []) as Array<{
      _id?: string;
      count?: number;
    }>;
    return arr.reduce<Record<string, number>>((acc, cur) => {
      const key = cur && cur._id != null ? String(cur._id) : "Unknown";
      acc[key] = cur && typeof cur.count === "number" ? cur.count : 0;
      return acc;
    }, {});
  }

  // Use the helper for each facet
  const byPaymentStatus = reduceFacet(agg.byPaymentStatus);
  const byPaymentMethod = reduceFacet(agg.byPaymentMethod);
  const byGender = reduceFacet(agg.byGender);
  const byCertificateStatus = reduceFacet(agg.byCertificateStatus);

  // Final stats object
  const stats: DashboardStats = {
    totals: {
      courses: courses.length,
      registrations: totalsAgg.totalRegistrations ?? 0,
      paidRegistrations: totalsAgg.paidRegistrations ?? 0,
      pendingRegistrations: totalsAgg.pendingRegistrations ?? 0,
      totalRevenue: totalsAgg.totalRevenue ?? 0,
    },
    registrationBreakdown: {
      byPaymentStatus,
      byPaymentMethod,
      byGender,
      byCertificateStatus,
    },
    monthly: {
      registrations: monthlyRegistrations,
      revenue: monthlyRegistrations.map((m) => ({
        month: m.month,
        count: m.count,
        revenue: m.revenue ?? 0,
      })),
    },
    courseStats: {
      upcoming,
      ongoing,
      completed,
      byCourse,
      topCourses,
    },
    recent: {
      recentPaidRegistrations: recentPaid,
    },
    raw: {
      registrationsCount: totalsAgg.totalRegistrations ?? 0,
      coursesCount: courses.length,
    },
  };

  return stats;
}
