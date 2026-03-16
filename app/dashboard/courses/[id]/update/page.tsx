import CourseForm from "@/app/dashboard/components/CourseForm";
import { getCourseById } from "@/lib/actions/course.actions";
import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};
const UpdatePage = async ({ params }: PageProps) => {
  const { id } = await params;

  const course = await getCourseById(id);
  if (!course) redirect("/dashboard/courses");

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6">Update course</h2>
      <CourseForm type="Update" course={course} courseId={id} />
    </div>
  );
};

export default UpdatePage;
