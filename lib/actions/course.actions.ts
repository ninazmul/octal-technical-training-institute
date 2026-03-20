"use server";

import { connectToDatabase } from "../database";
import { handleError, sanitizeCourse, sanitizeCourses } from "../utils";
import Course, { ICourse, ICourseSafe } from "../database/models/course.model";
import { unstable_cache } from "next/cache";

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
  seats?: number;
  isActive?: boolean;
  batch?: string;
  sku?: string;
  courseStartDate?: string;
  registrationDeadline?: string;
  schedule?: { day?: string; start?: string; end?: string }[];
  duration?: string;
  sessions?: string;
};

// -------------------- Helper: classify course --------------------
function classifyCourse(
  course: ICourse,
): "upcoming" | "ongoing" | "old" | "unknown" {
  if (!course.courseStartDate || !course.duration) return "unknown";

  const start = new Date(course.courseStartDate);
  const now = new Date();
  const durationDays = parseInt(course.duration); // assuming duration stored as string number of days
  const end = new Date(start);
  end.setDate(end.getDate() + durationDays);

  if (now < start) return "upcoming";
  if (now >= start && now <= end) return "ongoing";
  if (now > end) return "old";
  return "unknown";
}

// -------------------- Unified Action --------------------
export async function getCourses(options: {
  tab?: "all" | "upcoming" | "ongoing" | "old";
  category?: string;
  status?: "all" | "active"; // NEW option
}): Promise<ICourseSafe[]> {
  try {
    await connectToDatabase();

    // Decide query based on status
    const query = options.status === "active" ? { isActive: true } : {};

    const courses = await Course.find(query).lean<ICourse[]>();

    let filtered = courses;

    // Tab filter
    if (options.tab && options.tab !== "all") {
      filtered = filtered.filter(
        (course) => classifyCourse(course) === options.tab,
      );
    }

    // Category filter
    if (options.category && options.category.trim() !== "") {
      filtered = filtered.filter(
        (course) => course.category === options.category,
      );
    }

    return sanitizeCourses(filtered);
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
        const course = await Course.findById(courseId)
          .select(
            `
            title category photo price discountPrice seats batch
            courseStartDate duration sessions registrationDeadline
            prerequisites description modules schedule isActive sku
          `,
          )
          .lean<ICourse>();

        return course ? sanitizeCourse(course) : null;
      },
      // Cache key
      [`course-by-id-${courseId}`],
      {
        revalidate: 600, // 10 minutes
        tags: [`course-by-id-${courseId}`], // Tag for invalidation
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
    const regex = new RegExp(query, "i");

    const courses = await Course.find({
      isActive: true, // only search active courses
      title: regex,
    })
      .limit(10)
      .select(
        "title category photo price discountPrice seats duration courseStartDate registrationDeadline sku batch",
      )
      .lean<ICourse[]>();

    return courses ? sanitizeCourses(courses) : [];
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
    const deletedCourse = await Course.findByIdAndDelete(courseId).lean();
    if (!deletedCourse) throw new Error("Course not found");
    return { message: "Course deleted successfully" };
  } catch (error) {
    handleError(error);
  }
};
