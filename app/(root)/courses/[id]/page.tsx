import { getCourseById } from "@/lib/actions/course.actions";
import CourseDetailsClient from "@/components/shared/CourseDetailsClient";

export const revalidate = 60;

type PageProps = {
  params: Promise<{ id: string }>;
};

const CoursePage = async ({ params }: PageProps) => {
  const { id } = await params;
  const course = await getCourseById(id);

  if (!course) {
    return <div>Course not found</div>;
  }

  return <CourseDetailsClient course={course} />;
};

export default CoursePage;
