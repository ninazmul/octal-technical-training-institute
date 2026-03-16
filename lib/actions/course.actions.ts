"use server";

import { connectToDatabase } from "../database";
import { handleError } from "../utils";
import Course, { ICourse } from "../database/models/course.model";

export type CourseParams = {
  title: string;
  photo: string;
  description: string;
  prerequisites?: string[];
  modules: {
    title: string;
    content: string;
  }[];
  price: number;
  discountPrice?: number;
  seats?: number;
  isActive?: boolean;
};

// -------------------- CREATE --------------------
export const createCourse = async (data: CourseParams) => {
  try {
    await connectToDatabase();
    const newCourse = await Course.create(data);
    return JSON.parse(JSON.stringify(newCourse)) as ICourse;
  } catch (error) {
    handleError(error);
  }
};

// -------------------- GET ALL --------------------
export const getAllCourses = async () => {
  try {
    await connectToDatabase();
    const courses = await Course.find({}).lean();
    return JSON.parse(JSON.stringify(courses)) as ICourse[];
  } catch (error) {
    handleError(error);
  }
};

// -------------------- GET ONLY ACTIVE --------------------
export const getActiveCourses = async () => {
  try {
    await connectToDatabase();
    const courses = await Course.find({ isActive: true }).lean();
    return JSON.parse(JSON.stringify(courses)) as ICourse[];
  } catch (error) {
    handleError(error);
  }
};

// -------------------- GET BY ID --------------------
export const getCourseById = async (courseId: string) => {
  try {
    await connectToDatabase();
    const course = await Course.findById(courseId).lean();
    if (!course) throw new Error("Course not found");
    return JSON.parse(JSON.stringify(course)) as ICourse;
  } catch (error) {
    handleError(error);
  }
};

// -------------------- UPDATE --------------------
export const updateCourse = async (
  courseId: string,
  data: Partial<CourseParams>,
) => {
  try {
    await connectToDatabase();
    const updatedCourse = await Course.findByIdAndUpdate(courseId, data, {
      new: true,
    }).lean();
    if (!updatedCourse) throw new Error("Course not found");
    return JSON.parse(JSON.stringify(updatedCourse)) as ICourse;
  } catch (error) {
    handleError(error);
  }
};

// -------------------- TOGGLE ACTIVE --------------------
export const toggleCourseStatus = async (courseId: string) => {
  try {
    await connectToDatabase();
    const course = await Course.findById(courseId);
    if (!course) throw new Error("Course not found");

    course.isActive = !course.isActive;
    await course.save();

    return JSON.parse(JSON.stringify(course)) as ICourse;
  } catch (error) {
    handleError(error);
  }
};

// -------------------- DELETE --------------------
export const deleteCourse = async (courseId: string) => {
  try {
    await connectToDatabase();
    const deletedCourse = await Course.findByIdAndDelete(courseId).lean();
    if (!deletedCourse) throw new Error("Course not found");

    return { message: "Course deleted successfully" };
  } catch (error) {
    handleError(error);
  }
};
