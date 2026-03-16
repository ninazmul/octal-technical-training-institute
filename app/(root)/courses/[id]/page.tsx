import CourseDetailsServer from "@/components/shared/CourseDetailsServer";

type PageProps = {
  params: Promise<{ id: string }>;
};

const CoursePage = async ({ params }: PageProps) => {
  const { id } = await params;
  return <CourseDetailsServer id={id} />;
};

export default CoursePage;