"use server";

import { getCourseById } from "@/lib/actions/course.actions";
import CourseDetailsClient from "./CourseDetailsClient";

type Props = {
  id: string;
};

const CourseDetailsServer = async ({ id }: Props) => {
  const course = await getCourseById(id);

  if (!course) {
    return (
      <div className="px-4 py-10 text-center text-xl text-destructive">
        Course not found.
      </div>
    );
  }

  // Pass data into client component
  return <CourseDetailsClient course={course} />;
};

export default CourseDetailsServer;
