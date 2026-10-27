"use server";

import { connectToDatabase } from "../database";
import { handleError, sanitizeCourse, sanitizeCourses } from "../utils";
import Course, { ICourse, ICourseSafe } from "../database/models/course.model";
import { unstable_cache, revalidatePath, revalidateTag } from "next/cache";
import { logActivity } from "./activity-log.actions";

// -------------------- Params --------------------
export type CourseParams = {
  title: string;
  category: string;
  mode: "Online" | "Offline";
  photo: string;
  description: string;
  prerequisites?: string[];
  modules: { title: string; content: string }[];
  price: number;
  discountPrice?: number;
  rplPrice?: number;
  seats?: number;
  certification?: string;
  isActive?: boolean;
  batch?: string;
  sku?: string;
  courseStartDate?: string;
  registrationDeadline?: string;
  schedule?: { day?: string; start?: string; end?: string }[];
  duration?: string;
  sessions?: string;
};

// -------------------- Helpers: duration & classify --------------------
function parseDurationDays(durationStr?: string | null): number {
  if (!durationStr) return 0;
  const match = durationStr.match(/(\d+)\s*(day|week|month|year)s?/i);
  if (!match) {
    const val = parseInt(durationStr, 10);
    return isNaN(val) ? 0 : val;
  }
  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  switch (unit) {
    case "day":
      return value;
    case "week":
      return value * 7;
    case "month":
      return value * 30;
    case "year":
      return value * 365;
    default:
      return value;
  }
}

function classifyCourse(
  course: ICourse,
  nowMs: number = Date.now(),
): "upcoming" | "ongoing" | "old" | "unknown" {
  if (!course.courseStartDate || !course.duration) return "unknown";

  const start = new Date(course.courseStartDate).getTime();
  if (isNaN(start)) return "unknown";

  const durationDays = parseDurationDays(course.duration);
  const end = start + durationDays * 24 * 60 * 60 * 1000;

  if (nowMs < start) return "upcoming";
  if (nowMs >= start && nowMs <= end) return "ongoing";
  if (nowMs > end) return "old";
  return "unknown";
}

function sortCoursesByNearestDate(courses: ICourse[]): ICourse[] {
  const todayMs = Date.now();

  // Schwartzian transform: pre-calculate timestamps once (O(N)), avoiding repeated Date parsing inside sort (O(N log N))
  const mapped = courses.map((course) => {
    const rawDate = course.courseStartDate || course.registrationDeadline;
    const time = rawDate ? new Date(rawDate).getTime() : NaN;
    const isValid = !isNaN(time);
    const distance = isValid ? Math.abs(time - todayMs) : Infinity;

    return {
      course,
      distance,
      time: isValid ? time : Infinity,
    };
  });

  mapped.sort((a, b) => {
    if (a.distance !== b.distance) {
      return a.distance - b.distance;
    }
    return a.time - b.time;
  });

  return mapped.map((item) => item.course);
}

// -------------------- Unified Action --------------------
export async function getCourses(options: {
  tab?: "all" | "upcoming" | "ongoing" | "old";
  category?: string;
  status?: "all" | "active"; // NEW option
}): Promise<ICourseSafe[]> {
  try {
    return unstable_cache(async () => {
      await connectToDatabase();

      // Decide query based on status
      const query = options.status === "active" ? { isActive: true } : {};

      const courses = await Course.find(query).lean<ICourse[]>();

      let filtered = sortCoursesByNearestDate(courses);

      // Tab filter
      if (options.tab && options.tab !== "all") {
        const nowMs = Date.now();
        filtered = filtered.filter(
          (course) => classifyCourse(course, nowMs) === options.tab,
        );
      }

      // Category filter
      if (options.category && options.category.trim() !== "") {
        filtered = filtered.filter(
          (course) => course.category === options.category,
        );
      }

      return sanitizeCourses(filtered);
    }, [`getCourses-${options.tab}-${options.category}-${options.status}`], { revalidate: 600, tags: ["courses"] })();
  } catch (error) {
    handleError(error);
    return [];
  }
}

// -------------------- Other CRUD actions remain unchanged --------------------
export const createCourse = async (
  data: CourseParams,
): Promise<ICourseSafe | undefined> => {
  try {
    await connectToDatabase();
    const newCourse = await Course.create(data);

    if (newCourse) {
      await logActivity(
        "CREATE",
        "Course",
        `Created course '${newCourse.title}'`,
      );
      revalidatePath("/dashboard/courses");
      revalidatePath("/");
    }

    return newCourse ? sanitizeCourse(newCourse) : undefined;
  } catch (error) {
    handleError(error);
  }
};

// -------------------- GET COURSE BY ID --------------------
export const getCourseById = async (
  courseId: string,
): Promise<ICourseSafe | null> => {
  try {
    return unstable_cache(
      async () => {
        await connectToDatabase();
        const course = await Course.findById(courseId).lean<ICourse>();

        return course ? sanitizeCourse(course) : null;
      },
      // Cache key
      [`course-by-id-${courseId}`],
      {
        revalidate: 600, // 10 minutes
        tags: [`course-by-id-${courseId}`, "courses"], // Tag for invalidation
      },
    )();
  } catch (error) {
    handleError(error);
    return null;
  }
};

// -------------------- SEARCH --------------------
export const searchCourses = async (query: string): Promise<ICourseSafe[]> => {
  if (!query.trim()) return [];

  try {
    await connectToDatabase();
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedQuery, "i");

    const courses = await Course.find({
      isActive: true, // only search active courses
      title: regex,
    })
      .limit(10)
      .select(
        "title category photo price discountPrice rplPrice seats duration courseStartDate registrationDeadline sku batch",
      )
      .lean<ICourse[]>();

    return courses
      ? sanitizeCourses(sortCoursesByNearestDate(courses))
      : [];
  } catch (error) {
    handleError(error);
    return [];
  }
};

export const updateCourse = async (
  courseId: string,
  data: Partial<CourseParams>,
): Promise<ICourse | undefined> => {
  try {
    await connectToDatabase();
    const updatedCourse = await Course.findByIdAndUpdate(courseId, data, {
      new: true,
      runValidators: true,
    }).lean<ICourse>();
    if (!updatedCourse) throw new Error("Course not found");

    await logActivity(
      "UPDATE",
      "Course",
      `Updated course '${updatedCourse.title}'`,
    );

    revalidatePath("/dashboard/courses");
    revalidatePath(`/dashboard/courses/${courseId}/update`);
    revalidatePath(`/courses/${courseId}`);
    revalidatePath("/");

    return updatedCourse;
  } catch (error) {
    handleError(error);
  }
};

export const toggleCourseStatus = async (
  courseId: string,
): Promise<ICourse | undefined> => {
  try {
    await connectToDatabase();
    const course = await Course.findById(courseId);
    if (!course) throw new Error("Course not found");
    course.isActive = !course.isActive;
    await course.save();

    await logActivity(
      "TOGGLE_STATUS",
      "Course",
      `Toggled active status of course '${course.title}' to ${course.isActive}`,
    );

    revalidatePath("/dashboard/courses");
    revalidatePath("/");

    return course.toObject() as ICourse;
  } catch (error) {
    handleError(error);
  }
};

export const deleteCourse = async (
  courseId: string,
): Promise<{ message: string } | undefined> => {
  try {
    await connectToDatabase();

    const courseToDelete = await Course.findById(courseId);
    if (!courseToDelete) throw new Error("Course not found");

    const deletedCourse = await Course.findByIdAndDelete(courseId).lean();
    if (!deletedCourse) throw new Error("Course not found");

    await logActivity(
      "DELETE",
      "Course",
      `Deleted course '${courseToDelete.title}'`,
    );

    revalidatePath("/dashboard/courses");
    revalidatePath("/");

    return { message: "Course deleted successfully" };
  } catch (error) {
    handleError(error);
  }
};
